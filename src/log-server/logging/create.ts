import { FastifyReply, FastifyRequest } from 'fastify';
import { LoggingService } from '../LoggingService.js';

const loggingService = new LoggingService();

export async function createLog(
  request: FastifyRequest<{
    Body: {
      level: 'info' | 'warn' | 'error' | 'debug';
      service: string;
      message: string;
      userId?: number;
      userEmail?: string;
      metadata?: any;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const { level, service, message, userId, userEmail, metadata } = request.body;

    // Obtener información del request
    const ipAddress = request.ip;
    const userAgent = request.headers['user-agent'];

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      service,
      message,
      userId,
      userEmail,
      ipAddress,
      userAgent,
      metadata: metadata ? JSON.stringify(metadata) : undefined
    };

    const logId = await loggingService.log(logEntry);

    reply.send({
      success: true,
      data: { id: logId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    request.log.error(error, 'Error creating log entry');
    reply.status(500).send({
      success: false,
      message: 'Error creating log entry',
      timestamp: new Date().toISOString()
    });
  }
}