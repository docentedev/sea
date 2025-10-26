import { FastifyRequest, FastifyReply } from 'fastify';
import { FolderService } from '../../services/FolderService.js';

export const deleteFolder = async (request: FastifyRequest, reply: FastifyReply) => {
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
};