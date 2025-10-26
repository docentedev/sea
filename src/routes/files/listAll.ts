import { FastifyRequest, FastifyReply } from 'fastify';
import { FileService } from '../../services/FileService.js';
import { AuthService } from '../../services/AuthService.js';

export const listAllFiles = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const authService = new AuthService();
    if (!authService.isAdmin(request.user!)) {
      return reply.status(403).send({
        success: false,
        message: 'Admin access required',
        timestamp: new Date().toISOString()
      });
    }

    const { page = 1, limit = 20 } = request.query as any;
    const fileService = new FileService();
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
      message: 'Failed to list all files',
      timestamp: new Date().toISOString()
    });
  }
};