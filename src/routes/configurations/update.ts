import { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigurationService } from '../../services/ConfigurationService.js';

export const updateConfiguration = async (request: FastifyRequest, reply: FastifyReply) => {
  const configService = new ConfigurationService();
  try {
    const { id } = request.params as any;
    const configId = parseInt(id);
    const { name, value } = request.body as any;

    const configuration = configService.updateConfiguration(configId, { name, value });

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
      message: 'Configuration updated successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error updating configuration:', error);

    if (error.message.includes('already exists')) {
      return reply.status(409).send({
        success: false,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    return reply.status(500).send({
      success: false,
      message: 'Failed to update configuration',
      timestamp: new Date().toISOString()
    });
  }
};