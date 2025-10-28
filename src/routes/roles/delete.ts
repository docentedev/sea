import { FastifyRequest, FastifyReply } from 'fastify';
import { RoleService } from '../../services/RoleService.js';

export async function deleteRole(request: FastifyRequest, reply: FastifyReply) {
  try {
  const id = Number((request.params as any).id);
    if (!id) {
      return reply.status(400).send({ success: false, message: 'Missing role id' });
    }
    const service = new RoleService();
    const result = service.deleteRole(id);
    return reply.status(200).send({ success: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return reply.status(500).send({ success: false, message });
  }
}
