import { FastifyRequest, FastifyReply } from 'fastify';
import { FileService } from '../../services/FileService.js';

export const uploadFile = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    // Los archivos están disponibles en request.body cuando attachFieldsToBody: true
    const body = request.body as any;
    const files = body.files || [];

    // Handle virtual_folder_path - it might be an object with value property in multipart
    let virtualFolderPath = '/';
    if (body.virtual_folder_path) {
      if (typeof body.virtual_folder_path === 'string') {
        virtualFolderPath = body.virtual_folder_path;
      } else if (body.virtual_folder_path.value) {
        virtualFolderPath = body.virtual_folder_path.value;
      }
    }

    // Si files es un array, usarlo directamente, si no, convertirlo
    const fileArray = Array.isArray(files) ? files : [files];

    if (!fileArray || fileArray.length === 0) {
      return reply.status(400).send({
        success: false,
        message: 'No files uploaded',
        timestamp: new Date().toISOString()
      });
    }

    const userId = request.user!.id;
    const fileService = new FileService();
    const fileUploads: Array<{ file: any; filename: string; mimetype: string }> = [];

    // Procesar archivos
    for (const file of fileArray) {
      fileUploads.push({
        file: file,
        filename: file.filename,
        mimetype: file.mimetype
      });
    }

    // Subir archivos
    const results = await fileService.uploadFiles(fileUploads, userId, virtualFolderPath);

    return reply.send({
      success: true,
      data: results,
      message: `${results.length} file(s) uploaded successfully`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return reply.status(500).send({
      success: false,
      message: (error as Error).message || 'Failed to upload file',
      timestamp: new Date().toISOString()
    });
  }
};