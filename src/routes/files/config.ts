import { FastifyRequest, FastifyReply } from 'fastify';
import { FileService } from '../../services/FileService.js';

export const getUploadConfig = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const fileService = new FileService();

    const maxFileSize = parseInt(fileService.getConfigValue('max_file_size') || '104857600'); // 100MB default
    const maxFilesPerUpload = parseInt(fileService.getConfigValue('max_files_per_upload') || '10');
    const allowedFileTypes = fileService.getAllowedFileTypes();
    const allowedFileExtensions = fileService.getAllowedFileExtensions();
    const blockedExtensions = fileService.getBlockedFileExtensions();

    return reply.send({
      success: true,
      data: {
        maxFileSize,
        maxFilesPerUpload,
        allowedFileTypes,
        allowedFileExtensions,
        blockedFileExtensions: blockedExtensions
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting upload config:', error);
    return reply.status(500).send({
      success: false,
      message: (error as Error).message || 'Failed to get upload configuration',
      timestamp: new Date().toISOString()
    });
  }
};