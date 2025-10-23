import fastifyPlugin from 'fastify-plugin';
import fastifyStatic from '@fastify/static';
import { FastifyInstance } from 'fastify';
import * as path from 'path';

async function staticPlugin(fastify: FastifyInstance) {
  // Registrar el plugin de archivos estáticos
  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../../public'),
    prefix: '/public/',
    preCompressed: false,
    decorateReply: false,
  });

  fastify.log.info('Static files plugin registered');
}

export default fastifyPlugin(staticPlugin, {
  name: 'static-plugin',
});