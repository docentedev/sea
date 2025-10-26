import Fastify from 'fastify';
import { config, loggerOptions } from '../config/index.js';
import { LoggingDatabaseInitializer } from './logs/initializer.js';
import { LoggingRepository } from './logs/repository.js';

export class LoggingServer {
  private server: any;
  private port: number;
  private loggingRepo: LoggingRepository;

  constructor(port: number = 3001) {
    this.port = port;
    this.loggingRepo = new LoggingRepository();
  }

  async start(): Promise<void> {
    try {
      console.log(`🔄 Initializing logging database...`);
      // Inicializar base de datos de logs
      await LoggingDatabaseInitializer.initialize();
      console.log(`✅ Logging database initialized`);

      console.log(`🔄 Creating Fastify server for logging...`);
      // Crear servidor Fastify con la misma configuración de logger que el servidor principal
      this.server = Fastify({
        logger: config.logger ? loggerOptions : false,
      });
      console.log(`✅ Fastify server created`);

      console.log(`🔄 Registering logging routes...`);
      // Health check endpoint
      this.server.get('/health', async () => {
        return {
          status: 'ok',
          service: 'logging',
          timestamp: new Date().toISOString()
        };
      });

      // Basic log endpoint
      this.server.post('/api/logs', async (request: any, reply: any) => {
        try {
          const { level, service, message, userId, operation, resource, details, userEmail, ipAddress, userAgent, username } = request.body;

          // Preparar metadata con información adicional
          const metadataObj: any = {};
          if (operation !== undefined) metadataObj.operation = operation;
          if (resource !== undefined) metadataObj.resource = resource;
          if (details !== undefined) metadataObj.details = details;

          // Guardar log en base de datos
          const logId = await this.loggingRepo.create({
            timestamp: new Date().toISOString(),
            level,
            service,
            message,
            userId: userId || null,
            userEmail: userEmail || null,
            username: username || null,
            ipAddress: ipAddress || null,
            userAgent: userAgent || null,
            metadata: Object.keys(metadataObj).length > 0 ? JSON.stringify(metadataObj) : undefined
          });

          // También mostrar en consola para debugging
          console.log(`[${level.toUpperCase()}] ${service}: ${message}`);

          reply.send({
            success: true,
            message: 'Log recorded',
            logId,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error recording log:', error);
          reply.status(500).send({
            success: false,
            message: 'Error recording log',
            timestamp: new Date().toISOString()
          });
        }
      });

      // get filter and paginate logs endpoint
      this.server.get('/api/logs', async (request: any, reply: any) => {
        try {
          const { level, service, userId, startDate, endDate, page = 1, pageSize = 50 } = request.query;
          
          const filters: any = {};
          if (level) filters.level = level;
          if (service) filters.service = service;
          if (userId) filters.userId = parseInt(userId, 10);
          if (startDate) filters.startDate = startDate;
          if (endDate) filters.endDate = endDate;
          
          const offset = (page - 1) * pageSize;
          const logs = await this.loggingRepo.getLogs(filters, offset, parseInt(pageSize, 10));
          const totalLogs = await this.loggingRepo.countLogs(filters);
          reply.send({
            success: true,
            data: {
              logs,
              pagination: {
                page: parseInt(page, 10),
                pageSize: parseInt(pageSize, 10),
                total: totalLogs,
                totalPages: Math.ceil(totalLogs / pageSize)
              }
            },
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error retrieving logs:', error);
          reply.status(500).send({
            success: false,
            message: 'Error retrieving logs',
            timestamp: new Date().toISOString()
          });
        }
      });
      console.log(`✅ Logging routes registered`);

      console.log(`🔄 Starting logging server on port ${this.port}...`);
      // Iniciar servidor
      await this.server.listen({ port: this.port, host: '0.0.0.0' });

      console.log(`🚀 Logging server started on port ${this.port}`);
    } catch (error) {
      console.error('❌ Error starting logging server:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.server) {
      await this.server.close();
      console.log('🛑 Logging server stopped');
    }
  }

  getServer() {
    return this.server;
  }
}