import { FastifyPluginAsync } from 'fastify';
import { FolderService } from '../services/FolderService.js';
import { AuthService } from '../services/AuthService.js';
import { AuthUser } from '../types/index.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const folderRoutes: FastifyPluginAsync = async (fastify) => {
  const folderService = new FolderService();
  const authService = new AuthService();

  // Middleware para verificar autenticación
  const requireAuth = async (request: any, reply: any) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        message: 'Authorization header required',
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.substring(7);
    const user = authService.verifyToken(token);

    if (!user) {
      return reply.status(401).send({
        success: false,
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      });
    }

    request.user = user;
  };

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
  }, async (request, reply) => {
    try {
      const { parent = '' } = request.query as any;

      // Validar que la ruta no tenga traversal
      if (!folderService.validateFolderPath(parent)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid folder path',
          timestamp: new Date().toISOString()
        });
      }

      const folders = folderService.listFolders(parent);

      return reply.send({
        success: true,
        data: folders,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error listing folders:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to list folders',
        timestamp: new Date().toISOString()
      });
    }
  });

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
  }, async (request, reply) => {
    try {
      const { path } = request.query as any;

      if (!folderService.validateFolderPath(path)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid folder path',
          timestamp: new Date().toISOString()
        });
      }

      const folderInfo = folderService.getFolderInfo(path);

      return reply.send({
        success: true,
        data: folderInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting folder info:', error);
      return reply.status(404).send({
        success: false,
        message: 'Folder not found',
        timestamp: new Date().toISOString()
      });
    }
  });

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
  }, async (request, reply) => {
    try {
      const { name, parent = '' } = request.body as any;

      if (!folderService.validateFolderPath(parent)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid parent folder path',
          timestamp: new Date().toISOString()
        });
      }

      const folderPath = await folderService.createFolder(name, parent);

      return reply.status(201).send({
        success: true,
        data: { path: folderPath },
        message: 'Folder created successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error creating folder:', error);

      if (error.message === 'Folder already exists') {
        return reply.status(409).send({
          success: false,
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      return reply.status(500).send({
        success: false,
        message: 'Failed to create folder',
        timestamp: new Date().toISOString()
      });
    }
  });

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
  }, async (request, reply) => {
    try {
      const { path } = request.query as any;

      if (!folderService.validateFolderPath(path)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid folder path',
          timestamp: new Date().toISOString()
        });
      }

      const deleted = await folderService.deleteFolder(path);

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          message: 'Folder not found or could not be deleted',
          timestamp: new Date().toISOString()
        });
      }

      return reply.send({
        success: true,
        message: 'Folder deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error deleting folder:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to delete folder',
        timestamp: new Date().toISOString()
      });
    }
  });

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
  }, async (request, reply) => {
    try {
      const { parent = '', maxDepth = 3 } = request.query as any;

      if (!folderService.validateFolderPath(parent)) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid folder path',
          timestamp: new Date().toISOString()
        });
      }

      const tree = folderService.getFolderTree(parent, maxDepth);

      return reply.send({
        success: true,
        data: tree,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting folder tree:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to get folder tree',
        timestamp: new Date().toISOString()
      });
    }
  });
};

export default folderRoutes;