import { FastifyRequest, FastifyReply } from 'fastify';
import { RolePermissionService } from '../../services/RolePermissionService.js';

// GET /api/roles/:id/permissions - obtener IDs de permisos de un rol
export const getRolePermissions = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const service = new RolePermissionService();
  const permissionIds = service.getPermissionsForRole(Number(id));
  return {
    success: true,
    data: { permissionIds },
    timestamp: new Date().toISOString()
  };
};

// PUT /api/roles/:id/permissions - actualizar permisos de un rol
export const setRolePermissions = async (request: FastifyRequest, reply: FastifyReply) => {
  const { id } = request.params as { id: string };
  const { permissionIds } = request.body as { permissionIds: number[] };
  const service = new RolePermissionService();
  service.setPermissionsForRole(Number(id), permissionIds);
  return {
    success: true,
    message: 'Permisos actualizados',
    timestamp: new Date().toISOString()
  };
};
