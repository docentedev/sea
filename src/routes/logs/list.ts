import { FastifyRequest, FastifyReply } from 'fastify';
import { LoggingService } from '../../services';

export const listLogs = async (request: FastifyRequest, reply: FastifyReply) => {
    const queries = request.query as Record<string, any>;
    const logsService = LoggingService.getInstance();
    try {
        const filters: {
            level?: string;
            service?: string;
            userId?: number;
            startDate?: string;
            endDate?: string;
        } = {};

        if (queries.level) filters.level = queries.level;
        if (queries.service) filters.service = queries.service;
        if (queries.userId) filters.userId = parseInt(queries.userId, 10);
        if (queries.startDate) filters.startDate = queries.startDate;
        if (queries.endDate) filters.endDate = queries.endDate;

        const page = parseInt(queries.page, 10) || 1;
        const pageSize = parseInt(queries.pageSize, 10) || 50;

        const data = await logsService.getLogs(
            filters,
            page,
            pageSize
        );
        console.log('📝 Logs retrieved successfully:', data);
        return reply.send({
            success: true,
            data,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error listing logs:', error);
        return reply.status(500).send({
            success: false,
            message: 'Failed to list logs',
            timestamp: new Date().toISOString()
        });
    }
};