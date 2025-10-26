import { FastifyPluginAsync } from 'fastify';
import { HealthResponse } from '../../types';
import { listLogs } from './list';

const logsRoutes: FastifyPluginAsync = async (fastify) => {
    // Schema para validación y documentación
    const logsSchema = {
        description: 'Retrieve all logs with optional filtering and pagination',
        tags: ['logs'],
        summary: 'Get logs',
        response: {
            200: {
                type: 'object',
                properties: {
                    success: { type: 'boolean' },
                    data: {
                        type: 'object',
                        properties: {
                            logs: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        timestamp: { type: 'string' },
                                        level: { type: 'string' },
                                        service: { type: 'string' },
                                        message: { type: 'string' },
                                        userId: { type: ['number', 'null'] },
                                        userEmail: { type: ['string', 'null'] },
                                        ipAddress: { type: ['string', 'null'] },
                                        userAgent: { type: ['string', 'null'] },
                                        createdAt: { type: 'string' },
                                    },
                                },
                            },
                            pagination: {
                                type: 'object',
                                properties: {
                                    page: { type: 'number' },
                                    pageSize: { type: 'number' },
                                    total: { type: 'number' },
                                    totalPages: { type: 'number' },
                                },
                            },
                        },
                    },
                    timestamp: { type: 'string' },
                },
            },
        },
    };

    fastify.get<{ Reply: HealthResponse }>('/api/logs', { schema: logsSchema }, listLogs);
};

export default logsRoutes;
