import { FastifyPluginAsync } from 'fastify';
import { ConfigurationService } from '../services/ConfigurationService.js';
import { AuthService } from '../services/AuthService.js';
import { AuthUser } from '../types/index.js';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

const configurationRoutes: FastifyPluginAsync = async (fastify) => {
  const configService = new ConfigurationService();
  const authService = new AuthService();

  // Middleware para verificar autenticación
  const requireAuth = async (request: any, reply: any) => {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        message: 'Authorization header required',
        timestamp: new Date().toISOString()
      });
    }

    const token = authHeader.substring(7);
    const user = authService.verifyToken(token);

    if (!user) {
      return reply.status(401).send({
        success: false,
        message: 'Invalid or expired token',
        timestamp: new Date().toISOString()
      });
    }

    request.user = user;
  };

  // Middleware para verificar permisos de admin
  const requireAdmin = async (request: any, reply: any) => {
    if (!authService.isAdmin(request.user!)) {
      return reply.status(403).send({
        success: false,
        message: 'Admin privileges required',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Listar todas las configuraciones (admin only)
  fastify.get('/api/configurations', {
    preHandler: [requireAuth, requireAdmin]
  }, async (request, reply) => {
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
  });

  // Obtener configuración por ID (admin only)
  fastify.get('/api/configurations/:id', {
    preHandler: [requireAuth, requireAdmin]
  }, async (request, reply) => {
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
  });

  // Obtener configuración por nombre
  fastify.get('/api/configurations/name/:name', {
    preHandler: requireAuth
  }, async (request, reply) => {
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
  });

  // Crear configuración (admin only)
  fastify.post('/api/configurations', {
    preHandler: [requireAuth, requireAdmin],
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          value: { type: 'string' }
        },
        required: ['name', 'value']
      }
    }
  }, async (request, reply) => {
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
  });

  // Actualizar configuración (admin only)
  fastify.put('/api/configurations/:id', {
    preHandler: [requireAuth, requireAdmin],
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1 },
          value: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
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
  });

  // Eliminar configuración (admin only)
  fastify.delete('/api/configurations/:id', {
    preHandler: [requireAuth, requireAdmin]
  }, async (request, reply) => {
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
  });

  // Obtener valor de configuración por nombre (helper endpoint)
  fastify.get('/api/configurations/value/:name', {
    preHandler: requireAuth
  }, async (request, reply) => {
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
  });

  // Establecer valor de configuración (admin only)
  fastify.put('/api/configurations/value/:name', {
    preHandler: [requireAuth, requireAdmin],
    schema: {
      body: {
        type: 'object',
        properties: {
          value: { type: 'string' }
        },
        required: ['value']
      }
    }
  }, async (request, reply) => {
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
  });
};

export default configurationRoutes;