import { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigurationService } from '../../services/ConfigurationService.js';

export const getConfigurationValue = async (request: FastifyRequest, reply: FastifyReply) => {
  const configService = new ConfigurationService();
  try {
    const { name } = request.params as any;

    const value = configService.getConfigValue(name);

    if (value === null) {
      return reply.status(404).send({
        success: false,
        message: 'Configuration not found',
        timestamp: new Date().toISOString()
      });
    }

    return reply.send({
      success: true,
      data: { name, value },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting configuration value:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to get configuration value',
      timestamp: new Date().toISOString()
    });
  }
};