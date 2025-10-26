import { FastifyPluginAsync } from 'fastify';
import { AuthUser } from '../../types/index.js';
import { requireAuth } from '../../middlewares/auth.js';
import { listFiles } from './list';
import { listAllFiles } from './listAll';
import { getFile } from './get';
import { downloadFile } from './download';
import { uploadFile } from './upload';
import { deleteFile } from './delete';
import { getUploadConfig } from './config';
import { moveFile } from './move';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const fileRoutes: FastifyPluginAsync = async (fastify) => {
  // Listar archivos del usuario
  fastify.get('/api/files', {
    preHandler: requireAuth,
    schema: {
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
        }
      }
    }
  }, listFiles);

  // Listar todos los archivos (solo admin)
  fastify.get('/api/files/all', {
    preHandler: requireAuth
  }, listAllFiles);

  // Obtener archivo por ID
  fastify.get('/api/files/:id', {
    preHandler: requireAuth
  }, getFile);

  // Descargar archivo
  fastify.get('/api/files/:id/download', {
    preHandler: requireAuth
  }, downloadFile);

  // Subir archivo(s)
  fastify.post('/api/files/upload', {
    preHandler: requireAuth
  }, uploadFile);

  // Eliminar archivo
  fastify.delete('/api/files/:id', {
    preHandler: requireAuth
  }, deleteFile);

  // Obtener configuración de upload
  fastify.get('/api/files/upload/config', {
    preHandler: requireAuth
  }, getUploadConfig);

  // Mover archivo(s) a un directorio virtual diferente
  fastify.put('/api/files/move', {
    preHandler: requireAuth,
    schema: {
      body: {
        type: 'object',
        required: ['fileIds', 'destinationPath'],
        properties: {
          fileIds: {
            type: 'array',
            items: { type: 'integer' },
            minItems: 1
          },
          destinationPath: {
            type: 'string',
            minLength: 1
          }
        }
      }
    }
  }, moveFile);
};

export default fileRoutes;