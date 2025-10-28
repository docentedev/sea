import { FastifyRequest, FastifyReply } from 'fastify';
import { RoleService } from '../../services/RoleService.js';

export async function createRole(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { name, display_name, permissions = [], max_storage_gb = 10 } = request.body as any;
    if (!name || !display_name) {
      return reply.status(400).send({ success: false, message: 'Missing name or display_name' });
    }
    const service = new RoleService();
    const role = service.createRole({ name, display_name, permissions, max_storage_gb });
    return reply.status(201).send({ success: true, data: role });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return reply.status(500).send({ success: false, message });
  }
}
