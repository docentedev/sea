import { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigurationService } from '../../services/ConfigurationService.js';
import { AuthService } from '../../services/AuthService.js';

export const getConfigurationByName = async (request: FastifyRequest, reply: FastifyReply) => {
  const configService = new ConfigurationService();
  const authService = new AuthService();
  try {
    const { name } = request.params as any;

    const configuration = configService.getConfigurationByName(name);
    if (!configuration) {
      return reply.status(404).send({
        success: false,
        message: 'Configuration not found',
        timestamp: new Date().toISOString()
      });
    }

    // Solo admins pueden ver configuraciones sensibles
    if (name.startsWith('admin_') || name.startsWith('system_')) {
      if (!authService.isAdmin(request.user!)) {
        return reply.status(403).send({
          success: false,
          message: 'Access denied',
          timestamp: new Date().toISOString()
        });
      }
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