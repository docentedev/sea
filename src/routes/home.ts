import { FastifyPluginAsync } from 'fastify';
import { readFile } from 'fs/promises';
import { join } from 'path';

const homeRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', async (request, reply) => {
    try {
      const htmlPath = join(process.cwd(), 'public', 'index.html');
      const html = await readFile(htmlPath, 'utf-8');
      
      reply
        .type('text/html')
        .send(html);
    } catch (error) {
      fastify.log.error(error, 'Error serving home page');
      
      // Fallback HTML si no se puede leer el archivo
      const fallbackHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>SEA Server v2.0</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
            .container { max-width: 600px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 SEA Server v2.0</h1>
            <p>Single Executable Application with Fastify & TypeScript</p>
            <div style="margin: 30px 0;">
              <h3>Available Endpoints:</h3>
              <ul style="text-align: left; display: inline-block;">
                <li><a href="/health">GET /health</a> - Server health check</li>
                <li><a href="/info">GET /info</a> - System information</li>
                <li><a href="/api/time">GET /api/time</a> - Current timestamp</li>
                <li>POST /api/echo - Echo request data</li>
              </ul>
            </div>
          </div>
        </body>
        </html>
      `;
      
      reply
        .type('text/html')
        .send(fallbackHtml);
    }
  });
};

export default homeRoutes;