import fastifyPlugin from 'fastify-plugin';
import fastifyStatic from '@fastify/static';
import { FastifyInstance } from 'fastify';
import * as path from 'path';
import * as fs from 'fs';

async function staticPlugin(fastify: FastifyInstance) {
  // Determinar la ruta de los archivos estáticos
  // En desarrollo: ../../public (desde src/plugins/)
  // En SEA bundle: ./public (relativo al ejecutable)
  // En bundle directo: ../public (desde dist/)
  const isSEA = process.execPath.includes('sea-server') || process.execPath.endsWith('.exe');
  const isBundle = __dirname.includes('/dist') && !isSEA;

  let publicPath: string;
  if (isSEA) {
    publicPath = path.join(process.cwd(), 'public');  // Relativo al directorio del ejecutable
  } else if (isBundle) {
    publicPath = path.join(__dirname, '../public');   // Desde dist/ en bundle directo
  } else {
    publicPath = path.join(__dirname, '../../public'); // Desde src/plugins/ en desarrollo
  }

  fastify.log.info(`Static files path: ${publicPath} (SEA: ${isSEA}, Bundle: ${isBundle})`);
  fastify.log.info(`Current working directory: ${process.cwd()}`);
  fastify.log.info(`__dirname: ${__dirname}`);
  fastify.log.info(`process.execPath: ${process.execPath}`);

  // Verificar si el directorio existe
  if (!fs.existsSync(publicPath)) {
    fastify.log.error(`Static directory does not exist: ${publicPath}`);
    throw new Error(`Static directory not found: ${publicPath}`);
  }
  await fastify.register(fastifyStatic, {
    root: publicPath,
    prefix: '/',
    decorateReply: false,
  });

  // Hook para SPA routing - se ejecuta después de que fastifyStatic haya intentado servir el archivo
  fastify.addHook('preHandler', async (request, reply) => {
    const url = request.url;

    // Si es una ruta de API, no hacer nada
    if (url.startsWith('/api/')) {
      return;
    }

    // Si la ruta es exactamente '/' o un archivo que existe, dejar que fastifyStatic lo maneje
    if (url === '/' || fs.existsSync(path.join(publicPath, url))) {
      return;
    }

    // Para cualquier otra ruta (SPA routing), servir index.html
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      reply.type('text/html').send(indexContent);
      return reply;
    }
  });

  fastify.log.info('Static files plugin registered with React SPA support');
}

export default fastifyPlugin(staticPlugin, {
  name: 'static-plugin',
});