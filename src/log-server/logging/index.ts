import { FastifyPluginAsync } from 'fastify';
import { createLog } from './create.js';
import { getLogs } from './get.js';

const loggingRoutes: FastifyPluginAsync = async (fastify) => {
  // POST /api/logs - Crear una nueva entrada de log
  fastify.post('/api/logs', {
    schema: {
      body: {
        type: 'object',
        required: ['level', 'service', 'message'],
        properties: {
          level: { type: 'string', enum: ['info', 'warn', 'error', 'debug'] },
          service: { type: 'string' },
          message: { type: 'string' },
          userId: { type: 'number' },
          userEmail: { type: 'string' },
          metadata: { type: 'object' }
        }
      }
    }
  }, createLog);

  // GET /api/logs - Obtener logs con filtros
  fastify.get('/api/logs', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 1000, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 },
          level: { type: 'string', enum: ['info', 'warn', 'error', 'debug'] },
          service: { type: 'string' },
          userId: { type: 'number' },
          userEmail: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' }
        }
      }
    }
  }, getLogs);
};

export default loggingRoutes;