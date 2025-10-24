import { FastifyPluginAsync } from 'fastify';
import { FileService } from '../services/FileService.js';
import { AuthService } from '../services/AuthService.js';
import { AuthUser } from '../types/index.js';
import { Readable } from 'node:stream';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const fileRoutes: FastifyPluginAsync = async (fastify) => {
  const fileService = new FileService();
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
  }, async (request, reply) => {
    try {
      const { page = 1, limit = 20 } = request.query as any;
      const userId = request.user!.id;

      const result = fileService.getFilesByUser(userId, page, limit);

      return reply.send({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error listing files:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to list files',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Listar todos los archivos (solo admin)
  fastify.get('/api/files/all', {
    preHandler: requireAuth
  }, async (request, reply) => {
    try {
      if (!authService.isAdmin(request.user!)) {
        return reply.status(403).send({
          success: false,
          message: 'Admin access required',
          timestamp: new Date().toISOString()
        });
      }

      const { page = 1, limit = 20 } = request.query as any;
      const result = fileService.getAllFiles(page, limit);

      return reply.send({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error listing all files:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to list files',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Obtener archivo por ID
  fastify.get('/api/files/:id', {
    preHandler: requireAuth
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const fileId = parseInt(id);

      const file = fileService.getFileById(fileId);
      if (!file) {
        return reply.status(404).send({
          success: false,
          message: 'File not found',
          timestamp: new Date().toISOString()
        });
      }

      // Verificar permisos (usuario propio o admin)
      if (file.user_id !== request.user!.id && !authService.isAdmin(request.user!)) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      return reply.send({
        success: true,
        data: file,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting file:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to get file',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Descargar archivo
  fastify.get('/api/files/:id/download', {
    preHandler: requireAuth
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const fileId = parseInt(id);

      const fileStream = fileService.getFileStream(fileId);
      if (!fileStream) {
        return reply.status(404).send({
          success: false,
          message: 'File not found',
          timestamp: new Date().toISOString()
        });
      }

      const { stream, file } = fileStream;

      // Verificar permisos
      if (file.user_id !== request.user!.id && !authService.isAdmin(request.user!)) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      return reply
        .header('Content-Type', file.mime_type)
        .header('Content-Disposition', `attachment; filename="${file.original_filename}"`)
        .send(stream);
    } catch (error) {
      console.error('Error downloading file:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to download file',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Subir archivo(s)
  fastify.post('/api/files/upload', {
    preHandler: requireAuth
  }, async (request, reply) => {
    try {
      // Los archivos están disponibles en request.body cuando attachFieldsToBody: true
      const body = request.body as any;
      const files = body.files || [];
      
      // Handle virtual_folder_path - it might be an object with value property in multipart
      let virtualFolderPath = '/';
      if (body.virtual_folder_path) {
        if (typeof body.virtual_folder_path === 'string') {
          virtualFolderPath = body.virtual_folder_path;
        } else if (body.virtual_folder_path.value) {
          virtualFolderPath = body.virtual_folder_path.value;
        }
      }

      // Si files es un array, usarlo directamente, si no, convertirlo
      const fileArray = Array.isArray(files) ? files : [files];

      if (!fileArray || fileArray.length === 0) {
        return reply.status(400).send({
          success: false,
          message: 'No files uploaded',
          timestamp: new Date().toISOString()
        });
      }

      const userId = request.user!.id;
      const fileUploads: Array<{ file: any; filename: string; mimetype: string }> = [];

      // Procesar archivos
      for (const file of fileArray) {
        fileUploads.push({
          file: file,
          filename: file.filename,
          mimetype: file.mimetype
        });
      }

      // Subir archivos
      const results = await fileService.uploadFiles(fileUploads, userId, virtualFolderPath);

      return reply.send({
        success: true,
        data: results,
        message: `${results.length} file(s) uploaded successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error uploading files:', error);
      return reply.status(500).send({
        success: false,
        message: error.message || 'Failed to upload files',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Eliminar archivo
  fastify.delete('/api/files/:id', {
    preHandler: requireAuth
  }, async (request, reply) => {
    try {
      const { id } = request.params as any;
      const fileId = parseInt(id);

      const file = fileService.getFileById(fileId);
      if (!file) {
        return reply.status(404).send({
          success: false,
          message: 'File not found',
          timestamp: new Date().toISOString()
        });
      }

      // Verificar permisos
      if (file.user_id !== request.user!.id && !authService.isAdmin(request.user!)) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }

      const deleted = fileService.deleteFile(fileId);
      if (!deleted) {
        return reply.status(500).send({
          success: false,
          message: 'Failed to delete file',
          timestamp: new Date().toISOString()
        });
      }

      return reply.send({
        success: true,
        message: 'File deleted successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to delete file',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Obtener configuración de upload
  fastify.get('/api/files/upload/config', {
    preHandler: requireAuth
  }, async (request, reply) => {
    try {
      const maxFileSize = fileService.getMaxFileSize();
      const maxFilesPerUpload = parseInt(fileService.getConfigValue('max_files_per_upload') || '10');
      const allowedFileTypes = fileService.getConfigValue('allowed_file_types') || 'image/*,application/pdf,text/*';

      return reply.send({
        success: true,
        data: {
          maxFileSize,
          maxFileSizeMB: Math.round(maxFileSize / (1024 * 1024)),
          maxFilesPerUpload,
          allowedFileTypes: allowedFileTypes.split(',')
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting upload config:', error);
      return reply.status(500).send({
        success: false,
        message: 'Failed to get upload configuration',
        timestamp: new Date().toISOString()
      });
    }
  });
};

export default fileRoutes;