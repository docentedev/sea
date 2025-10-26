import { FastifyPluginAsync } from 'fastify';
import { AuthUser } from '../../types/index.js';
import { requireAuth } from '../../middlewares/auth.js';
import { listFolders } from './list.js';
import { getFolderInfo } from './info.js';
import { createFolder } from './create.js';
import { deleteFolder } from './delete.js';
import { getFolderTree } from './tree.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const folderRoutes: FastifyPluginAsync = async (fastify) => {
  // Listar carpetas
  fastify.get('/api/folders', {
    preHandler: requireAuth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          parent: { type: 'string', default: '' }
        }
      }
    }
  }, listFolders);

  // Obtener información de una carpeta
  fastify.get('/api/folders/info', {
    preHandler: requireAuth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          path: { type: 'string' }
        },
        required: ['path']
      }
    }
  }, getFolderInfo);

  // Crear carpeta
  fastify.post('/api/folders', {
    preHandler: requireAuth,
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          parent: { type: 'string', default: '' }
        },
        required: ['name']
      }
    }
  }, createFolder);

  // Eliminar carpeta (recursivamente)
  fastify.delete('/api/folders', {
    preHandler: requireAuth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          path: { type: 'string' }
        },
        required: ['path']
      }
    }
  }, deleteFolder);

  // Obtener árbol de carpetas
  fastify.get('/api/folders/tree', {
    preHandler: requireAuth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          parent: { type: 'string', default: '' },
          maxDepth: { type: 'integer', minimum: 1, maximum: 5, default: 3 }
        }
      }
    }
  }, getFolderTree);
};

export default folderRoutes;