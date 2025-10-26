import { FastifyRequest, FastifyReply } from 'fastify';
import { VirtualFolderService } from '../../services/VirtualFolderService';
import { FolderRepository } from '../../repositories/FolderRepository';
import { FileRepository } from '../../repositories/FileRepository';

export const deleteVirtualFolder = async (request: FastifyRequest, reply: FastifyReply) => {
  // Get database instance from system service
  const db = request.server.systemService.getDatabaseService().getDatabase();
  const folderRepo = new FolderRepository(db);
  const fileRepo = new FileRepository(db);
  const folderService = new VirtualFolderService(folderRepo, fileRepo, db);

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
};