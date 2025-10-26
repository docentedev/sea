import { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigurationService } from '../../services/ConfigurationService.js';

export const setConfigurationValue = async (request: FastifyRequest, reply: FastifyReply) => {
  const configService = new ConfigurationService();
  try {
    const { name } = request.params as any;
    const { value } = request.body as any;

    const configuration = configService.setConfigValue(name, value);

    return reply.send({
      success: true,
      data: configuration,
      message: 'Configuration value set successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error setting configuration value:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to set configuration value',
      timestamp: new Date().toISOString()
    });
  }
};