import { FastifyPluginAsync } from 'fastify';
import { AuthUser } from '../../types/index.js';
import { requireAuth, requireAdmin } from '../../middlewares/auth.js';
import { listConfigurations } from './list.js';
import { getConfigurationById } from './getById.js';
import { getConfigurationByName } from './getByName.js';
import { createConfiguration } from './create.js';
import { updateConfiguration } from './update.js';
import { deleteConfiguration } from './delete.js';
import { getConfigurationValue } from './getValue.js';
import { setConfigurationValue } from './setValue.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const configurationRoutes: FastifyPluginAsync = async (fastify) => {
  // Listar todas las configuraciones (admin only)
  fastify.get('/api/configurations', {
    preHandler: [requireAuth, requireAdmin]
  }, listConfigurations);

  // Obtener configuración por ID (admin only)
  fastify.get('/api/configurations/:id', {
    preHandler: [requireAuth, requireAdmin]
  }, getConfigurationById);

  // Obtener configuración por nombre
  fastify.get('/api/configurations/name/:name', {
    preHandler: requireAuth
  }, getConfigurationByName);

  // Crear configuración (admin only)
  fastify.post('/api/configurations', {
    preHandler: [requireAuth, requireAdmin],
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          value: { type: 'string' }
        },
        required: ['name', 'value']
      }
    }
  }, createConfiguration);

  // Actualizar configuración (admin only)
  fastify.put('/api/configurations/:id', {
    preHandler: [requireAuth, requireAdmin],
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          value: { type: 'string' }
        }
      }
    }
  }, updateConfiguration);

  // Eliminar configuración (admin only)
  fastify.delete('/api/configurations/:id', {
    preHandler: [requireAuth, requireAdmin]
  }, deleteConfiguration);

  // Obtener valor de configuración por nombre (helper endpoint)
  fastify.get('/api/configurations/value/:name', {
    preHandler: requireAuth
  }, getConfigurationValue);

  // Establecer valor de configuración (admin only)
  fastify.put('/api/configurations/value/:name', {
    preHandler: [requireAuth, requireAdmin],
    schema: {
      body: {
        type: 'object',
        properties: {
          value: { type: 'string' }
        },
        required: ['value']
      }
    }
  }, setConfigurationValue);
};

export default configurationRoutes;