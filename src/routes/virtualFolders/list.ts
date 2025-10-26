import { FastifyRequest, FastifyReply } from 'fastify';
import { VirtualFolderService } from '../../services/VirtualFolderService';
import { FolderRepository } from '../../repositories/FolderRepository';
import { FileRepository } from '../../repositories/FileRepository';
import { AuthService } from '../../services/AuthService';

export const listVirtualFolders = async (request: FastifyRequest, reply: FastifyReply) => {
  // Get database instance from system service
  const db = request.server.systemService.getDatabaseService().getDatabase();
  const folderRepo = new FolderRepository(db);
  const fileRepo = new FileRepository(db);
  const folderService = new VirtualFolderService(folderRepo, fileRepo, db);
  const authService = new AuthService();

  try {
    const { parent_path } = request.query as any;
    const user = request.user!;

    if (parent_path !== undefined) {
      // Obtener contenido de una carpeta específica
      const isAdmin = authService.isAdmin(user);
      const contents = await folderService.getFolderContents(parent_path, isAdmin ? undefined : user.id);
      reply.send({
        success: true,
        data: contents,
        timestamp: new Date().toISOString()
      });
    } else {
      // Listar todas las carpetas del usuario
      const folders = await folderService.getUserFolders(user.id);
      reply.send({
        success: true,
        data: folders,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error: any) {
    reply.status(500).send({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};