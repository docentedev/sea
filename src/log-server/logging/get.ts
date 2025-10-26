import { FastifyReply, FastifyRequest } from 'fastify';
import { LoggingService } from '../LoggingService.js';

const loggingService = new LoggingService();

export async function getLogs(
  request: FastifyRequest<{
    Querystring: {
      limit?: number;
      offset?: number;
      level?: string;
      service?: string;
      userId?: number;
      userEmail?: string;
      startDate?: string;
      endDate?: string;
    };
  }>,
  reply: FastifyReply
) {
  try {
    const {
      limit = 50,
      offset = 0,
      level,
      service,
      userId,
      userEmail,
      startDate,
      endDate
    } = request.query;

    const logs = await loggingService.getLogs({
      limit,
      offset,
      level,
      service,
      userId: userId ? parseInt(userId.toString()) : undefined,
      userEmail,
      startDate,
      endDate
    });

    reply.send({
      success: true,
      data: logs,
      pagination: {
        limit,
        offset,
        hasMore: logs.length === limit
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    request.log.error(error, 'Error retrieving logs');
    reply.status(500).send({
      success: false,
      message: 'Error retrieving logs',
      timestamp: new Date().toISOString()
    });
  }
}