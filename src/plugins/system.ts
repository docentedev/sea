import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { SystemService } from '../services';

declare module 'fastify' {
  interface FastifyInstance {
    systemService: SystemService;
  }
}

const systemPlugin: FastifyPluginAsync = async (fastify) => {
  const systemService = new SystemService();
  
  fastify.decorate('systemService', systemService);
  
  // Hook para agregar request ID a todas las respuestas
  fastify.addHook('onRequest', async (request, reply) => {
    const requestId = systemService.generateRequestId();
    request.headers['x-request-id'] = requestId;
    reply.header('x-request-id', requestId);
  });

  // Hook para logging de requests
  fastify.addHook('onResponse', async (request, reply) => {
    fastify.log.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    }, 'Request completed');
  });
};

export default fp(systemPlugin, {
  name: 'system',
});