import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DatabaseConnection } from '../../database/connection.js';
import { SharedLinkService } from '../../services/SharedLinkService.js';
import { comparePassword } from '../../utils/hash.js';

const db = DatabaseConnection.getConnection();
const sharedLinkService = new SharedLinkService(db);

export default async function (fastify: FastifyInstance) {
    // Public download endpoint for shared links

    // ...existing code...

    fastify.post('/api/share', async (request: FastifyRequest, reply: FastifyReply) => {
        const { file_id, password, expires_at, max_access_count } = request.body as any;
        // user_id puede venir de sesión si está autenticado
        const user_id = typeof request.user?.id === 'number' ? request.user.id : undefined;
        const link = sharedLinkService.createLink({ file_id, user_id, password, expires_at, max_access_count });
        reply.send({ token: link.token, url: `/api/shared/${link.token}` });
    });

    fastify.get('/api/shared/:token', async (request: FastifyRequest, reply: FastifyReply) => {
        const { token } = request.params as any;
        const { password } = request.query as any;
        const link = sharedLinkService.getLink(token);
        if (!link || link.revoked) return reply.code(404).send({ error: 'Link not found or revoked' });
        if (link.expires_at && new Date(link.expires_at) < new Date()) return reply.code(410).send({ error: 'Link expired' });
        if (link.max_access_count && link.access_count >= link.max_access_count) return reply.code(410).send({ error: 'Max access reached' });
        if (link.password_hash) {
            if (!password || !comparePassword(password, link.password_hash)) {
                return reply.code(401).send({ error: 'Password required or incorrect' });
            }
        }
        sharedLinkService.accessLink(token); // incrementa acceso
        // Buscar archivo y servir solo datos públicos
        const db = DatabaseConnection.getConnection();
        const file = db.prepare('SELECT id, original_filename, mime_type, size, path FROM files WHERE id = ?').get(link.file_id);
        if (!file) return reply.code(404).send({ error: 'File not found' });
        reply.send({
            file: {
                id: file.id,
                name: file.original_filename,
                mime_type: file.mime_type,
                size: file.size,
                // No se expone path ni info interna
            },
            link: {
                token: link.token,
                expires_at: link.expires_at,
                max_access_count: link.max_access_count,
                access_count: link.access_count,
                revoked: link.revoked
            }
        });
    });

    fastify.post('/api/shared/:token/access', async (request: FastifyRequest, reply: FastifyReply) => {
        const { token } = request.params as any;
        const link = sharedLinkService.accessLink(token);
        if (!link) return reply.code(404).send({ error: 'Link not found or expired/revoked' });
        reply.send({ link });
    });

    fastify.delete('/api/shared/:token', async (request: FastifyRequest, reply: FastifyReply) => {
        const { token } = request.params as any;
        sharedLinkService.revokeLink(token);
        reply.send({ success: true });
    });

    fastify.get('/api/shared/:token/download', async (request, reply) => {
        const { token } = request.params as any;
        const { password } = request.query as any;

        const link = sharedLinkService.getLink(token);
        if (!link || link.revoked) return reply.code(404).send({ error: 'Link not found or revoked' });
        if (link.expires_at && new Date(link.expires_at) < new Date()) return reply.code(410).send({ error: 'Link expired' });
        if (link.max_access_count && link.access_count >= link.max_access_count) return reply.code(410).send({ error: 'Max access reached' });
        if (link.password_hash) {
            if (!password || !comparePassword(password, link.password_hash)) {
                return reply.code(401).send({ error: 'Password required or incorrect' });
            }
        }
        sharedLinkService.accessLink(token); // incrementa acceso
        // Buscar archivo
        const db = DatabaseConnection.getConnection();
        const file = db.prepare('SELECT id, original_filename, mime_type, path FROM files WHERE id = ?').get(link.file_id);
        if (!file) return reply.code(404).send({ error: 'File not found' });

        const videoMimeTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/mkv', 'video/quicktime'];
        const fs = require('fs');
        const stat = fs.statSync(file.path);
        const range = request.headers.range;

        if (videoMimeTypes.includes(file.mime_type) && range) {
            // Streaming con soporte de rangos
            const total = stat.size;
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
            const chunkSize = (end - start) + 1;
            const stream = fs.createReadStream(file.path, { start, end });
            reply.code(206);
            reply.header('Content-Range', `bytes ${start}-${end}/${total}`);
            reply.header('Accept-Ranges', 'bytes');
            reply.header('Content-Length', chunkSize);
            reply.header('Content-Type', file.mime_type);
            return reply.send(stream);
        } else {
            // Descarga normal o streaming sin rango
            reply.header('Content-Type', file.mime_type);
            reply.header('Content-Length', stat.size);
            if (!videoMimeTypes.includes(file.mime_type)) {
                reply.header('Content-Disposition', `attachment; filename="${file.original_filename}"`);
            }
            return reply.send(fs.createReadStream(file.path));
        }
    });
}
