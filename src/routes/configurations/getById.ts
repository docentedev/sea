import { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigurationService } from '../../services/ConfigurationService.js';

export const getConfigurationById = async (request: FastifyRequest, reply: FastifyReply) => {
  const configService = new ConfigurationService();
  try {
    const { id } = request.params as any;
    const configId = parseInt(id);

    const configuration = configService.getConfigurationById(configId);
    if (!configuration) {
      return reply.status(404).send({
        success: false,
        message: 'Configuration not found',
        timestamp: new Date().toISOString()
      });
    }

    return reply.send({
      success: true,
      data: configuration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting configuration:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to get configuration',
      timestamp: new Date().toISOString()
    });
  }
};