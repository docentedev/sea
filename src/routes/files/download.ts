import { FastifyRequest, FastifyReply } from 'fastify';
import { FileService } from '../../services/FileService.js';
import { AuthService } from '../../services/AuthService.js';
import fs from 'node:fs';

export const downloadFile = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as any;
    const fileId = parseInt(id);

    const fileService = new FileService();
    const fileStream = fileService.getFileStream(fileId);
    if (!fileStream) {
      return reply.status(404).send({
        success: false,
        message: 'File not found',
        timestamp: new Date().toISOString()
      });
    }

    const { stream, file } = fileStream;
    const authService = new AuthService();

    // Verificar permisos
    if (file.user_id !== request.user!.id && !authService.isAdmin(request.user!)) {
      return reply.status(403).send({
        success: false,
        message: 'Access denied',
        timestamp: new Date().toISOString()
      });
    }

    const stat = fs.statSync(file.path);
    const fileSize = stat.size;
    const range = request.headers.range;
    const { action } = request.query as { action?: string };

    // Determine response type based on action parameter or range header
    const isDownload = action === 'download';
    const isStreaming = range || action === 'stream' || action === 'preview';

    // Handle range requests for streaming
    if (isStreaming && range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      // Create a new stream for the range
      const rangeStream = fs.createReadStream(file.path, { start, end });

      return reply
        .status(206)
        .header('Content-Range', `bytes ${start}-${end}/${fileSize}`)
        .header('Accept-Ranges', 'bytes')
        .header('Content-Length', chunksize)
        .header('Content-Type', file.mime_type)
        .header('Cache-Control', 'no-cache')
        .send(rangeStream);
    }

    // For preview/streaming requests (full file, inline)
    if (isStreaming) {
      return reply
        .header('Content-Type', file.mime_type)
        .header('Content-Length', fileSize)
        .header('Accept-Ranges', 'bytes')
        .header('Cache-Control', 'no-cache')
        .send(stream);
    }

    // For download requests (full file, attachment)
    return reply
      .header('Content-Type', file.mime_type)
      .header('Content-Length', fileSize)
      .header('Accept-Ranges', 'bytes')
      .header('Cache-Control', 'no-cache')
      .header('Content-Disposition', `attachment; filename="${file.original_filename}"`)
      .send(stream);
  } catch (error) {
    console.error('Error downloading file:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to download file',
      timestamp: new Date().toISOString()
    });
  }
};