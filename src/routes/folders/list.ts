import { FastifyRequest, FastifyReply } from 'fastify';
import { FolderService } from '../../services/FolderService.js';

export const listFolders = async (request: FastifyRequest, reply: FastifyReply) => {
  const folderService = new FolderService();
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
};