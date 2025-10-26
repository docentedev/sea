import { FastifyRequest, FastifyReply } from 'fastify';
import { FolderService } from '../../services/FolderService.js';

export const getFolderInfo = async (request: FastifyRequest, reply: FastifyReply) => {
  const folderService = new FolderService();
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
};