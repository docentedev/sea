// Detectar si estamos corriendo como Single Executable Application
export let isSEA = false;
try {
  const sea = require('node:sea');
  isSEA = sea.isSea();
} catch (e) {
  // El módulo node:sea no está disponible en versiones anteriores
  isSEA = false;
}

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';

export interface ServerConfig {
  port: number;
  host: string;
  environment: string;
  logger: boolean;
  trustProxy: boolean;
  loggingPort?: number;
  loggingEnabled?: boolean;
}

export interface UserConfig {
  username: string;
  email: string;
  password: string;
  role: string;
  storageQuotaGb: number;
  forceUpdate: boolean;
}

export interface AppConfig {
  name: string;
  version: string;
  description: string;
  isSEA: boolean;
}

export interface DatabaseConfig {
  path: string;
  logsPath?: string;
}

export interface ConfigFile {
  server: {
    port: number;
    host: string;
    trustProxy: boolean;
    logger: boolean;
    loggingEnabled?: boolean;
    loggingPort?: number;
  };
  database: DatabaseConfig;
  users: {
    forceCreateInitial: boolean;
    initialUsers: UserConfig[];
  };
  app: {
    name: string;
    version: string;
    description: string;
  };
}

// Función para obtener la ruta del archivo de configuración
function getConfigPath(): string {
  // Si estamos en SEA, buscar al lado del ejecutable
  if (isSEA) {
    const execPath = process.execPath;
    const execDir = dirname(execPath);
    return join(execDir, 'nas-cloud-config.json');
  }

  // En desarrollo, buscar en el directorio del proyecto
  return join(process.cwd(), 'nas-cloud-config.json');
}

// Función para cargar configuración desde archivo
function loadConfig(): ConfigFile {
  const configPath = getConfigPath();

  try {
    if (existsSync(configPath)) {
      const configData = readFileSync(configPath, 'utf-8');
      const parsedConfig = JSON.parse(configData);
      console.log(`📄 Configuration loaded from: ${configPath}`);
      return parsedConfig;
    } else {
      console.warn(`⚠️  Configuration file not found at: ${configPath}`);
      console.warn(`📝 Using default configuration`);
      return getDefaultConfig();
    }
  } catch (error) {
    console.error(`❌ Error loading configuration from ${configPath}:`, error);
    console.warn(`📝 Using default configuration`);
    return getDefaultConfig();
  }
}

// Configuración por defecto
function getDefaultConfig(): ConfigFile {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      trustProxy: false,
      logger: true
    },
    database: {
      path: './data/nas-cloud.db'
    },
    users: {
      forceCreateInitial: false,
      initialUsers: [
        {
          username: 'admin',
          email: 'admin@nas-cloud.local',
          password: 'admin123',
          role: 'admin',
          storageQuotaGb: 1000,
          forceUpdate: false
        }
      ]
    },
    app: {
      name: 'NAS Cloud',
      version: '2.0.0',
      description: 'Personal Cloud Storage Solution'
    }
  };
}

// Cargar configuración
const fileConfig = loadConfig();

// Configuración del servidor
export const config: ServerConfig = {
  port: fileConfig.server.port,
  host: fileConfig.server.host,
  environment: process.env.NODE_ENV || 'production',
  logger: fileConfig.server.logger,
  trustProxy: fileConfig.server.trustProxy,
  loggingPort: fileConfig.server.loggingPort,
  loggingEnabled: fileConfig.server.loggingEnabled,
};

export const appConfig: AppConfig = {
  ...fileConfig.app,
  isSEA,
};

export const databaseConfig = fileConfig.database;
export const usersConfig = fileConfig.users;

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