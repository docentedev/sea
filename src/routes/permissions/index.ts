
import { FastifyInstance } from 'fastify';
import { listPermissions } from './list.js';
import { createPermission } from './create.js';
import { updatePermission } from './update.js';
import { deletePermission } from './delete.js';
import { getPermissionById } from './getById.js';

export default async function permissionRoutes(fastify: FastifyInstance) {
  fastify.get('/api/permissions', listPermissions);
  fastify.post('/api/permissions', createPermission);
  fastify.put('/api/permissions/:id', updatePermission);
  fastify.delete('/api/permissions/:id', deletePermission);
  fastify.get('/api/permissions/:id', getPermissionById);
}
