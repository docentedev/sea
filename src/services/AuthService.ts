import { UserService } from './UserService.js';
import { RoleService } from './RoleService.js';
import { LoginRequest, LoginResponse, AuthUser } from '../types/index.js';
import { UserWithRole } from '../models/User.js';
import * as crypto from 'crypto';

export class AuthService {
    private userService: UserService;
    private roleService: RoleService;
    private secretKey: string;

    constructor() {
        this.userService = new UserService();
        this.roleService = new RoleService();
        // En producción, usar una clave secreta fuerte desde variables de entorno
        this.secretKey = process.env.JWT_SECRET || 'nas-cloud-secret-key-change-in-production';
    }

    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            const { username, password } = credentials;

            // Validar entrada
            if (!username || !password) {
                return {
                    success: false,
                    expiresAt: null,
                    message: 'Username and password are required',
                    timestamp: new Date().toISOString()
                };
            }

            // Autenticar usuario
            const userWithRole = this.userService.authenticate(username, password);

            if (!userWithRole) {
                return {
                    expiresAt: null,
                    success: false,
                    message: 'Invalid username or password',
                    timestamp: new Date().toISOString()
                };
            }

            // Verificar si el usuario está activo
            if (!userWithRole.is_active) {
                return {
                    success: false,
                    expiresAt: null,
                    message: 'Account is disabled',
                    timestamp: new Date().toISOString()
                };
            }

            // Obtener información del rol
            const role = this.roleService.getRoleById(userWithRole.role_id);
            if (!role) {
                return {
                    success: false,
                    expiresAt: null,
                    message: 'User role not found',
                    timestamp: new Date().toISOString()
                };
            }

            // Generar token JWT simple (en producción usar una librería como jsonwebtoken)
            const token = this.generateToken(userWithRole);
            const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)).toISOString(); // 24 horas desde ahora

            return {
                success: true,
                user: {
                    id: userWithRole.id,
                    username: userWithRole.username,
                    email: userWithRole.email,
                    role: {
                        id: role.id,
                        name: role.name,
                        display_name: role.display_name,
                        permissions: role.permissions
                    },
                    storage_quota_gb: userWithRole.storage_quota_gb,
                    storage_used_gb: userWithRole.storage_used_gb
                },
                token,
                expiresAt,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                expiresAt: null,
                message: 'Internal server error during login',
                timestamp: new Date().toISOString()
            };
        }
    }

    private generateToken(user: UserWithRole): string {
        // Obtener rol para el token
        const role = this.roleService.getRoleById(user.role_id);
        if (!role) {
            throw new Error('User role not found');
        }

        // Crear payload JWT simple
        const payload = {
            userId: user.id,
            username: user.username,
            role: role.name,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
        };

        // Codificar header y payload en base64
        const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
        const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');

        // Crear firma
        const data = `${header}.${payloadStr}`;
        const signature = crypto.createHmac('sha256', this.secretKey).update(data).digest('base64url');

        return `${data}.${signature}`;
    }

    verifyToken(token: string): AuthUser | null {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.log('❌ Token inválido: formato incorrecto');
                return null;
            }

            const [header, payload, signature] = parts;

            // Verificar firma
            const data = `${header}.${payload}`;
            const expectedSignature = crypto.createHmac('sha256', this.secretKey).update(data).digest('base64url');

            if (signature !== expectedSignature) {
                console.log('❌ Token inválido: firma no coincide');
                return null;
            }

            // Decodificar payload
            const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString());

            // Verificar expiración
            if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
                console.log('❌ Token expirado');
                return null;
            }

            // Obtener usuario completo
            const user = this.userService.getUserWithRole(decodedPayload.userId);
            if (!user || !user.is_active) {
                console.log('❌ Usuario no encontrado o inactivo');
                return null;
            }

            // Obtener información del rol
            const role = this.roleService.getRoleById(user.role_id);
            if (!role) {
                console.log('❌ Rol del usuario no encontrado');
                return null;
            }

            console.log('✅ Token verificado correctamente para el usuario:', user.username);

            return {
                id: user.id,
                username: user.username,
                email: user.email,
                role: {
                    id: role.id,
                    name: role.name,
                    display_name: role.display_name,
                    permissions: role.permissions,
                    can_share: role.can_share,
                    can_admin: role.can_admin
                }
            };
        } catch (error) {
            console.error('❌ Error al verificar el token:', error);
            return null;
        }
    }

    isAdmin(user: AuthUser): boolean {
        return user.role.can_admin === true;
    }

    hasPermission(user: AuthUser, permission: string): boolean {
        return user.role.permissions.includes(permission);
    }
}