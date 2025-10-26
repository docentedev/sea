import { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigurationService } from '../../services/ConfigurationService.js';

export const listConfigurations = async (request: FastifyRequest, reply: FastifyReply) => {
  const configService = new ConfigurationService();
  try {
    const configurations = configService.getAllConfigurations();

    return reply.send({
      success: true,
      data: configurations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error listing configurations:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to list configurations',
      timestamp: new Date().toISOString()
    });
  }
};