import { FastifyPluginAsync } from 'fastify';
import { VirtualFolderService } from '../services/VirtualFolderService';
import { FolderRepository } from '../repositories/FolderRepository';
import { FileRepository } from '../repositories/FileRepository';
import { AuthService } from '../services/AuthService';
import { AuthUser } from '../types/index.js';
import { DatabaseSync } from 'node:sqlite';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const virtualFolderRoutes: FastifyPluginAsync = async (fastify) => {
  // Get database instance from system service
  const db = fastify.systemService.getDatabaseService().getDatabase();
  const folderRepo = new FolderRepository(db);
  const fileRepo = new FileRepository(db);
  const folderService = new VirtualFolderService(folderRepo, fileRepo, db);
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
  }, async (request, reply) => {
    try {
      const { name, path, parent_path } = request.body as any;
      const user = request.user!;

      const folder = await folderService.createFolder({
        name,
        path,
        parent_path: parent_path || null,
        user_id: user.id
      });

      reply.send({
        success: true,
        data: folder,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      reply.status(400).send({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Obtener carpeta por ID
  fastify.get('/api/virtual-folders/:id', {
    preHandler: requireAuth
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const folder = await folderService.getFolderById(parseInt(id));

      if (!folder) {
        return reply.status(404).send({
          success: false,
          message: 'Folder not found',
          timestamp: new Date().toISOString()
        });
      }

      reply.send({
        success: true,
        data: folder,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

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
  }, async (request, reply) => {
    try {
      const { parent_path } = request.query as any;
      const user = request.user!;

      if (parent_path !== undefined) {
        // Obtener contenido de una carpeta específica
        const contents = await folderService.getFolderContents(parent_path, user.id);
        reply.send({
          success: true,
          data: contents,
          timestamp: new Date().toISOString()
        });
      } else {
        // Listar todas las carpetas del usuario
        const folders = await folderService.getUserFolders(user.id);
        reply.send({
          success: true,
          data: folders,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

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
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { name, path } = request.body as any;

      const folder = await folderService.updateFolder(parseInt(id), { name, path });

      if (!folder) {
        return reply.status(404).send({
          success: false,
          message: 'Folder not found',
          timestamp: new Date().toISOString()
        });
      }

      reply.send({
        success: true,
        data: folder,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      reply.status(400).send({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Eliminar carpeta
  fastify.delete('/api/virtual-folders/:id', {
    preHandler: requireAuth
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const deleted = await folderService.deleteFolder(parseInt(id));

      if (!deleted) {
        return reply.status(404).send({
          success: false,
          message: 'Folder not found',
          timestamp: new Date().toISOString()
        });
      }

      reply.send({
        success: true,
        message: 'Folder deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      reply.status(400).send({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

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
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const { new_parent_path } = request.body as any;

      const folder = await folderService.moveFolder(parseInt(id), new_parent_path);

      if (!folder) {
        return reply.status(404).send({
          success: false,
          message: 'Folder not found',
          timestamp: new Date().toISOString()
        });
      }

      reply.send({
        success: true,
        data: folder,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      reply.status(400).send({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Obtener jerarquía de carpetas
  fastify.get('/api/virtual-folders/hierarchy', {
    preHandler: requireAuth
  }, async (request, reply) => {
    try {
      const user = request.user!;
      const hierarchy = await folderService.getPathHierarchy(user.id);

      reply.send({
        success: true,
        data: hierarchy,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      reply.status(500).send({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
};

export default virtualFolderRoutes;