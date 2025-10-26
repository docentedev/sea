import { FastifyRequest, FastifyReply } from 'fastify';
import { VirtualFolderService } from '../../services/VirtualFolderService';
import { FolderRepository } from '../../repositories/FolderRepository';
import { FileRepository } from '../../repositories/FileRepository';

export const getVirtualFolderHierarchy = async (request: FastifyRequest, reply: FastifyReply) => {
  // Get database instance from system service
  const db = request.server.systemService.getDatabaseService().getDatabase();
  const folderRepo = new FolderRepository(db);
  const fileRepo = new FileRepository(db);
  const folderService = new VirtualFolderService(folderRepo, fileRepo, db);

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
};