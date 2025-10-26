import Fastify from 'fastify';
import { config, loggerOptions, corsOptions } from './config';

// Plugins
import systemPlugin from './plugins/system';
import staticPlugin from './plugins/static';

// Routes
import healthRoutes from './routes/health/';
import infoRoutes from './routes/info/';
import authRoutes from './routes/auth/';
import userRoutes from './routes/users/';
import roleRoutes from './routes/roles/';
import fileRoutes from './routes/files/';
import folderRoutes from './routes/folders/';
import virtualFolderRoutes from './routes/virtualFolders/';
import configurationRoutes from './routes/configurations/';
import logsRoutes from './routes/logs/';

// Services
import { LoggingServer } from './log-server/LoggingServer.js';

async function buildServer() {
  // Crear instancia de Fastify
  const fastify = Fastify({
    logger: config.logger ? loggerOptions : false,
    trustProxy: config.trustProxy,
    disableRequestLogging: false,
    routerOptions: {
      ignoreTrailingSlash: true,
    },
  });

  // Registrar plugins
  await fastify.register(import('@fastify/cors'), corsOptions);
  await fastify.register(import('@fastify/multipart'), {
    limits: {
      fileSize: 1024 * 1024 * 1024, // 1GB por defecto, será sobreescrito por configuración
      files: 10, // máximo 10 archivos por request
      fields: 10 // máximo 10 campos de formulario
    },
    attachFieldsToBody: true
  });
  await fastify.register(staticPlugin);
  await fastify.register(systemPlugin);

  // Registrar rutas
  await fastify.register(healthRoutes);
  await fastify.register(infoRoutes);
  await fastify.register(authRoutes);
  await fastify.register(userRoutes);
  await fastify.register(roleRoutes);
  await fastify.register(fileRoutes);
  await fastify.register(folderRoutes);
  await fastify.register(virtualFolderRoutes);
  await fastify.register(configurationRoutes);
  await fastify.register(logsRoutes);

  // Hook para manejo de errores
  fastify.setErrorHandler(async (error, request, reply) => {
    fastify.log.error(error);
    
    const statusCode = error.statusCode || 500;
    const errorResponse = {
      error: error.name || 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      isSEA: fastify.systemService ? true : false,
      statusCode,
      path: request.url,
    };

    reply.status(statusCode).send(errorResponse);
  });

  // Hook para rutas no encontradas - ahora manejado por static plugin para SPA
  /*
  fastify.setNotFoundHandler(async (request, reply) => {
    const notFoundResponse = {
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
      timestamp: new Date().toISOString(),
      isSEA: fastify.systemService ? true : false,
      statusCode: 404,
      path: request.url,
    };

    reply.status(404).send(notFoundResponse);
  });
  */

  return fastify;
}

async function start() {
  let loggingServer: LoggingServer | null = null;

  try {
    const fastify = await buildServer();

    // Iniciar servidor de logging si está habilitado
    if (config.loggingEnabled && config.loggingPort) {
      console.log(`🔄 Starting logging server on port ${config.loggingPort}...`);
      loggingServer = new LoggingServer(config.loggingPort);
      await loggingServer.start();
      console.log(`✅ Logging server started successfully on port ${config.loggingPort}`);
    } else {
      console.log(`ℹ️ Logging server disabled or no port configured`);
    }

    // Manejo de señales para shutdown graceful
    const gracefulShutdown = async (signal: string) => {
      fastify.log.info(`Received ${signal}, shutting down gracefully...`);

      try {
        // Detener servidor de logging
        if (loggingServer) {
          await loggingServer.stop();
        }

        await fastify.close();
        fastify.log.info('Servers closed successfully');
        process.exit(0);
      } catch (error) {
        fastify.log.error(error, 'Error during shutdown');
        process.exit(1);
      }
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    // Manejo de errores no capturados
    process.on('uncaughtException', (error) => {
      fastify.log.fatal(error, 'Uncaught exception');
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      fastify.log.fatal({ reason, promise }, 'Unhandled rejection');
      process.exit(1);
    });

    // Iniciar servidor principal
    await fastify.listen({
      port: config.port,
      host: config.host,
    });

    fastify.log.info(`🚀 Main server started successfully`);
    fastify.log.info(`🌐 Main server listening on http://${config.host}:${config.port}`);
    
    if (loggingServer) {
      fastify.log.info(`📊 Logging server listening on http://0.0.0.0:${config.loggingPort}`);
    }

  } catch (error) {
    console.error('❌ Error starting servers:', error);

    // Intentar detener el servidor de logging si falló el principal
    if (loggingServer) {
      try {
        await loggingServer.stop();
      } catch (shutdownError) {
        console.error('❌ Error stopping logging server:', shutdownError);
      }
    }

    process.exit(1);
  }
}

// Verificar si estamos corriendo como módulo principal
if (require.main === module) {
  start();
}

export { buildServer, start };