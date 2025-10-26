import { FastifyRequest, FastifyReply } from 'fastify';
import { FileService } from '../../services/FileService.js';
import { AuthService } from '../../services/AuthService.js';

export const moveFile = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { fileIds, destinationPath } = request.body as { fileIds: number[], destinationPath: string };
    const userId = request.user!.id;

    const fileService = new FileService();
    const authService = new AuthService();

    // Validate destination path format
    if (!destinationPath.startsWith('/')) {
      return reply.status(400).send({
        success: false,
        message: 'Destination path must start with /',
        timestamp: new Date().toISOString()
      });
    }

    // If destination is not root, verify the folder exists
    if (destinationPath !== '/') {
      const folderExists = await fileService.virtualFolderExists(destinationPath, userId);
      if (!folderExists) {
        return reply.status(400).send({
          success: false,
          message: 'Destination folder does not exist',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Verificar permisos para todos los archivos
    for (const fileId of fileIds) {
      const file = fileService.getFileById(fileId);
      if (!file) {
        return reply.status(404).send({
          success: false,
          message: `File with ID ${fileId} not found`,
          timestamp: new Date().toISOString()
        });
      }

      if (file.user_id !== userId && !authService.isAdmin(request.user!)) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Move files
    const movedFiles = await fileService.moveFiles(fileIds, destinationPath, userId);

    return reply.send({
      success: true,
      message: `Successfully moved ${movedFiles.length} file(s)`,
      data: {
        movedFiles,
        destinationPath
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error moving files:', error);
    return reply.status(500).send({
      success: false,
      message: (error as Error).message || 'Failed to move files',
      timestamp: new Date().toISOString()
    });
  }
};