import { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigurationService } from '../../services/ConfigurationService.js';

export const deleteConfiguration = async (request: FastifyRequest, reply: FastifyReply) => {
  const configService = new ConfigurationService();
  try {
    const { id } = request.params as any;
    const configId = parseInt(id);

    const deleted = configService.deleteConfiguration(configId);

    if (!deleted) {
      return reply.status(404).send({
        success: false,
        message: 'Configuration not found',
        timestamp: new Date().toISOString()
      });
    }

    return reply.send({
      success: true,
      message: 'Configuration deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting configuration:', error);
    return reply.status(500).send({
      success: false,
      message: 'Failed to delete configuration',
      timestamp: new Date().toISOString()
    });
  }
};