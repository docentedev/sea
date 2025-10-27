import { FastifyRequest, FastifyReply } from 'fastify';
import { PermissionService } from '../../services/PermissionService.js';

export const deletePermission = async (request: FastifyRequest, reply: FastifyReply) => {
  const permissionService = new PermissionService();
  try {
    const { id } = request.params as { id: string };
    const deleted = permissionService.deletePermission(Number(id));
    if (!deleted) {
      return reply.status(404).send({
        success: false,
        message: 'Permission not found',
        timestamp: new Date().toISOString()
      });
    }
    return {
      success: true,
      message: 'Permission deleted',
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
