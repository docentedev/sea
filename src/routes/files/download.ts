import { FastifyRequest, FastifyReply } from 'fastify';
import { FileService } from '../../services/FileService.js';
import fs from 'node:fs';

export const downloadFile = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params as any;
    const fileId = parseInt(id);
    const { action } = request.query as { action?: string };
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

    const stat = fs.statSync(file.path);
    const fileSize = stat.size;
    const range = request.headers.range;

    // Determine response type based on action parameter or range header
    const isStreaming = range || action === 'stream' || action === 'preview';

    // Video MIME types that support range requests for better streaming
    const videoMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mkv', 'video/quicktime', 'video/x-msvideo', 'video/avi'];

    console.log(`📁 DownloadFile: Preparing to ${isStreaming ? 'stream' : 'download'} file ID ${fileId} (${file.mime_type})`);
    // Handle range requests for streaming (especially important for videos)
    if (isStreaming && videoMimeTypes.includes(file.mime_type) && range) {
      // Streaming con soporte de rangos
      const total = stat.size;
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
      const chunkSize = (end - start) + 1;
      const stream = fs.createReadStream(file.path, { start, end });
      reply.code(206);
      reply.header('Content-Range', `bytes ${start}-${end}/${total}`);
      reply.header('Accept-Ranges', 'bytes');
      reply.header('Content-Length', chunkSize);
      reply.header('Content-Type', file.mime_type);
      return reply.send(stream);
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
