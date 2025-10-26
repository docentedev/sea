import { FastifyRequest, FastifyReply } from 'fastify';
import { FolderService } from '../../services/FolderService.js';

export const getFolderTree = async (request: FastifyRequest, reply: FastifyReply) => {
  const folderService = new FolderService();
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
};