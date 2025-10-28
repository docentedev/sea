import { FastifyRequest, FastifyReply } from 'fastify';
/**
 * Middleware para verificar permisos de usuario.
 * Permite acceso si el usuario tiene el permiso solicitado o el permiso 'admin'.
 * Uso: preHandler: [requirePermission('manage_config')]
 */
export function requirePermission(permission: string) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
        const user = request.user;
        if (!user) {
            return reply.status(401).send({ success: false, message: 'No autenticado' });
        }
        // Leer permisos directamente del usuario (provenientes del JWT)
        const permissions: string[] = user.permissions || [];
        if (permissions.includes('admin') || permissions.includes(permission)) {
            return;
        }
        return reply.status(403).send({ success: false, message: 'Permiso denegado' });
    };
}
