import { FastifyRequest, FastifyReply } from 'fastify';
import { VirtualFolderService } from '../../services/VirtualFolderService';
import { FolderRepository } from '../../repositories/FolderRepository';
import { FileRepository } from '../../repositories/FileRepository';

export const createVirtualFolder = async (request: FastifyRequest, reply: FastifyReply) => {
  // Get database instance from system service
  const db = request.server.systemService.getDatabaseService().getDatabase();
  const folderRepo = new FolderRepository(db);
  const fileRepo = new FileRepository(db);
  const folderService = new VirtualFolderService(folderRepo, fileRepo, db);

  try {
    const { name, path, parent_path } = request.body as any;
    const user = request.user!;

    const folder = await folderService.createFolder({
      name,
      path,
      parent_path: parent_path || null,
      user_id: user.id
    });

    reply.send({
      success: true,
      data: folder,
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