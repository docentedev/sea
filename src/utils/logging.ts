import { FastifyRequest, FastifyReply } from 'fastify';
import { loggingService } from '../services/index.js';

export interface RequestContext {
  userId?: number;
  userEmail?: string;
  username?: string;
  ip?: string;
  userAgent?: string;
  method: string;
  url: string;
}

/**
 * Extrae información del contexto de la request para logging
 */
export function extractRequestContext(request: FastifyRequest): RequestContext {
  // TEMPORAL: Hardcode user info for testing
  const user = request.user || { id: 1, username: 'admin', email: 'admin@nas-cloud.local' };
  return {
    userId: user.id,
    userEmail: user.email,
    username: user.username,
    ip: request.ip || (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim(),
    userAgent: request.headers['user-agent'] as string,
    method: request.method,
    url: request.url,
  };
}

/**
 * Middleware para logging de requests
 */
export async function logRequest(request: FastifyRequest, reply: FastifyReply) {
  const context = extractRequestContext(request);
  const startTime = Date.now();

  // Log cuando la request llega
  await loggingService.info('http', `Request started: ${context.method} ${context.url}`, {
    ...context,
    timestamp: new Date().toISOString(),
  });

  // Log cuando la response se envía
  reply.raw.on('finish', async () => {
    const duration = Date.now() - startTime;
    const statusCode = reply.statusCode;

    await loggingService.info('http', `Request completed: ${context.method} ${context.url} - ${statusCode}`, {
      ...context,
      statusCode,
      duration,
      timestamp: new Date().toISOString(),
    });
  });
}

/**
 * Función helper para logging de operaciones exitosas
 */
export async function logSuccess(
  service: string,
  operation: string,
  context: RequestContext,
  additionalData?: Record<string, any>
) {
  await loggingService.info(service, `Operation successful: ${operation}`, {
    ...context,
    operation,
    success: true,
    ...additionalData,
  });
}

/**
 * Función helper para logging de operaciones fallidas
 */
export async function logError(
  service: string,
  operation: string,
  error: Error,
  context: RequestContext,
  additionalData?: Record<string, any>
) {
  await loggingService.error(service, `Operation failed: ${operation} - ${error.message}`, {
    ...context,
    operation,
    success: false,
    error: error.message,
    stack: error.stack,
    ...additionalData,
  });
}

/**
 * Función helper para logging de operaciones de usuario
 */
export async function logUserOperation(
  operation: string,
  targetUserId: number,
  targetUserEmail: string,
  context: RequestContext,
  additionalData?: Record<string, any>
) {
  await loggingService.logUserAction(operation, targetUserId, targetUserEmail, {
    id: context.userId!,
    email: context.userEmail!,
  }, {
    ...context,
    ...additionalData,
  });
}