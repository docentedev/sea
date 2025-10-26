import { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigurationService } from '../../services/ConfigurationService.js';

export const createConfiguration = async (request: FastifyRequest, reply: FastifyReply) => {
  const configService = new ConfigurationService();
  try {
    const { name, value } = request.body as any;

    const configuration = configService.createConfiguration({ name, value });

    return reply.status(201).send({
      success: true,
      data: configuration,
      message: 'Configuration created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error creating configuration:', error);

    if (error.message.includes('already exists')) {
      return reply.status(409).send({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    return reply.status(500).send({
      success: false,
      message: 'Failed to create configuration',
      timestamp: new Date().toISOString()
    });
  }
};