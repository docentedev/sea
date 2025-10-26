import { FastifyRequest, FastifyReply } from 'fastify';
import { FolderService } from '../../services/FolderService.js';

export const createFolder = async (request: FastifyRequest, reply: FastifyReply) => {
  const folderService = new FolderService();
  try {
    const { name, parent = '' } = request.body as any;

    if (!folderService.validateFolderPath(parent)) {
      return reply.status(400).send({
        success: false,
        message: 'Invalid parent folder path',
        timestamp: new Date().toISOString()
      });
    }

    const folderPath = await folderService.createFolder(name, parent);

    return reply.status(201).send({
      success: true,
      data: { path: folderPath },
      message: 'Folder created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error creating folder:', error);

    if (error.message === 'Folder already exists') {
      return reply.status(409).send({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    return reply.status(500).send({
      success: false,
      message: 'Failed to create folder',
      timestamp: new Date().toISOString()
    });
  }
};