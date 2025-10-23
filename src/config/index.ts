// Detectar si estamos corriendo como Single Executable Application
export let isSEA = false;
try {
  const sea = require('node:sea');
  isSEA = sea.isSea();
} catch (e) {
  // El módulo node:sea no está disponible en versiones anteriores
  isSEA = false;
}

export interface ServerConfig {
  port: number;
  host: string;
  environment: string;
  logger: boolean;
  trustProxy: boolean;
}

// Configuración del servidor
export const config: ServerConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  environment: process.env.NODE_ENV || 'production',
  logger: true,
  trustProxy: false,
};

export const appConfig = {
  name: 'SEA Server',
  version: '2.0.0',
  description: 'Single Executable Application with Fastify and TypeScript',
  isSEA,
};

// Configuración de CORS
export const corsOptions = {
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Configuración del logger (simplificada para SEA)
export const loggerOptions = {
  level: 'info',
  // Solo usar pino-pretty en desarrollo y cuando no es SEA
  ...(config.environment === 'development' && !isSEA ? {
    // Simplemente usar console logging en desarrollo por ahora
    // Para evitar problemas con pino-pretty en SEA
  } : {})
};