import { FastifyRequest, FastifyReply } from 'fastify';
import { FileService } from '../../services/FileService.js';

export const listFiles = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { page = 1, limit = 20 } = request.query as any;
    const userId = request.user!.id;

    const fileService = new FileService();
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
};