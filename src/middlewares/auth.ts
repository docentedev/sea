import { AuthService } from '../services/AuthService.js';
import { AuthUser } from '../types/index.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const authService = new AuthService();

// Middleware para verificar autenticación
export const requireAuth = async (request: any, reply: any) => {
  // Check for Authorization header first
  const authHeader = request.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const user = authService.verifyToken(token);
    if (user) {
      request.user = user;
      return;
    }
  }

  // Check for token in query parameters (for streaming URLs)
  const queryToken = request.query.token;
  if (queryToken) {
    const user = authService.verifyToken(queryToken);
    if (user) {
      request.user = user;
      return;
    }
  }

  return reply.status(401).send({
    success: false,
    message: 'Authorization header or token parameter required',
    timestamp: new Date().toISOString()
  });
};

// Middleware para verificar permisos de admin
export const requireAdmin = async (request: any, reply: any) => {
  if (!authService.isAdmin(request.user!)) {
    return reply.status(403).send({
      success: false,
      message: 'Admin privileges required',
      timestamp: new Date().toISOString()
    });
  }
};