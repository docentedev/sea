import { FastifyPluginAsync } from 'fastify';
import { AuthUser } from '../../types/index.js';
import { requireAuth } from '../../middlewares/auth.js';
import { createVirtualFolder } from './create.js';
import { getVirtualFolderById } from './getById.js';
import { listVirtualFolders } from './list.js';
import { updateVirtualFolder } from './update.js';
import { deleteVirtualFolder } from './delete.js';
import { moveVirtualFolder } from './move.js';
import { getVirtualFolderHierarchy } from './hierarchy.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const virtualFolderRoutes: FastifyPluginAsync = async (fastify) => {
  // Get database instance from system service
  const db = fastify.systemService.getDatabaseService().getDatabase();

  // Crear carpeta
  fastify.post('/api/virtual-folders', {
    preHandler: requireAuth,
    schema: {
      body: {
        type: 'object',
        required: ['name', 'path'],
        properties: {
          name: { type: 'string', minLength: 1 },
          path: { type: 'string', minLength: 1 },
          parent_path: { type: 'string' }
        }
      }
    }
  }, createVirtualFolder);

  // Obtener carpeta por ID
  fastify.get('/api/virtual-folders/:id', {
    preHandler: requireAuth
  }, getVirtualFolderById);

  // Listar carpetas del usuario
  fastify.get('/api/virtual-folders', {
    preHandler: requireAuth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          parent_path: { type: 'string' }
        }
      }
    }
  }, listVirtualFolders);

  // Actualizar carpeta
  fastify.put('/api/virtual-folders/:id', {
    preHandler: requireAuth,
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          path: { type: 'string', minLength: 1 }
        }
      }
    }
  }, updateVirtualFolder);

  // Eliminar carpeta
  fastify.delete('/api/virtual-folders/:id', {
    preHandler: requireAuth
  }, deleteVirtualFolder);

  // Mover carpeta
  fastify.post('/api/virtual-folders/:id/move', {
    preHandler: requireAuth,
    schema: {
      body: {
        type: 'object',
        required: ['new_parent_path'],
        properties: {
          new_parent_path: { type: 'string' }
        }
      }
    }
  }, moveVirtualFolder);

  // Obtener jerarquía de carpetas
  fastify.get('/api/virtual-folders/hierarchy', {
    preHandler: requireAuth
  }, getVirtualFolderHierarchy);
};

export default virtualFolderRoutes;