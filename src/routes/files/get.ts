import { FastifyRequest, FastifyReply } from 'fastify';
import { FileService } from '../../services/FileService.js';
import { AuthService } from '../../services/AuthService.js';

export const getFile = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as any;
    const fileId = parseInt(id);

    const fileService = new FileService();
    const authService = new AuthService();

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
};