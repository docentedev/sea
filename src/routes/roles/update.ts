import { FastifyRequest, FastifyReply } from 'fastify';
import { RoleService } from '../../services/RoleService.js';

export async function updateRole(request: FastifyRequest, reply: FastifyReply) {
  try {
    const id = Number((request.params as any).id);
    const { display_name, permissions, max_storage_gb } = request.body as any;
    if (!id) {
      return reply.status(400).send({ success: false, message: 'Missing role id' });
    }
    const service = new RoleService();
    const updated = service.updateRole(id, { display_name, permissions, max_storage_gb });
    if (!updated) {
      return reply.status(404).send({ success: false, message: 'Role not found' });
    }
    return reply.status(200).send({ success: true, data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return reply.status(500).send({ success: false, message });
  }
}
