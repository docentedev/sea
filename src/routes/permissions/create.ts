import { FastifyRequest, FastifyReply } from 'fastify';
import { PermissionService } from '../../services/PermissionService.js';
import { CreatePermissionData } from '../../models/Permission.js';

export const createPermission = async (request: FastifyRequest, reply: FastifyReply) => {
  const permissionService = new PermissionService();
  try {
    const body = request.body as CreatePermissionData;
    if (!body.name || !body.description) {
      return reply.status(400).send({
        success: false,
        message: 'Name and description are required',
        timestamp: new Date().toISOString()
      });
    }
    const permission = permissionService.createPermission(body);
    return {
      success: true,
      data: { permission },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return reply.status(500).send({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};
