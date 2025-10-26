import { FastifyRequest, FastifyReply } from 'fastify';
import { RoleService } from '../../services/RoleService.js';

export const listRoles = async (request: FastifyRequest, reply: FastifyReply) => {
  const roleService = new RoleService();
  try {
    console.log('📋 Getting all roles');
    const roles = roleService.getAllRoles();

    console.log(`✅ Found ${roles.length} roles`);
    return {
      success: true,
      data: {
        roles: roles
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error getting roles:', error);
    return reply.status(500).send({
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};