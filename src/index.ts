import * as http from 'http';
import * as url from 'url';

// Detectar si estamos corriendo como Single Executable Application
let isSEA = false;
try {
  const sea = require('node:sea');
  isSEA = sea.isSea();
} catch (e) {
  // El módulo node:sea no está disponible en versiones anteriores
  isSEA = false;
}

interface ServerConfig {
  port: number;
  host: string;
}

class SimpleServer {
  private server: http.Server;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.server = this.createServer();
  }

  private createServer(): http.Server {
    return http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
      const parsedUrl = url.parse(req.url || '', true);
      const pathname = parsedUrl.pathname || '/';
      
      console.log(`${new Date().toISOString()} - ${req.method} ${pathname}`);

      // Configurar headers CORS básicos
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // Router simple
      switch (pathname) {
        case '/':
          this.handleHome(req, res);
          break;
        case '/health':
          this.handleHealth(req, res);
          break;
        case '/info':
          this.handleInfo(req, res);
          break;
        case '/api/time':
          this.handleTime(req, res);
          break;
        case '/api/echo':
          this.handleEcho(req, res);
          break;
        default:
          this.handleNotFound(req, res);
      }
    });
  }

  private handleHome(req: http.IncomingMessage, res: http.ServerResponse): void {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>SEA Server - Single Executable Application</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { padding: 10px; border-radius: 4px; margin: 10px 0; }
        .sea { background: #d4edda; color: #155724; }
        .normal { background: #fff3cd; color: #856404; }
        .endpoint { background: #e7f3ff; padding: 15px; margin: 10px 0; border-left: 4px solid #0066cc; }
        code { background: #f8f9fa; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 SEA Server</h1>
        <p>Servidor HTTP simple construido con TypeScript y Node.js</p>
        
        <div class="status ${isSEA ? 'sea' : 'normal'}">
            <strong>Estado:</strong> ${isSEA ? '📦 Ejecutándose como Single Executable Application' : '🔧 Ejecutándose en modo desarrollo'}
        </div>

        <h2>📡 Endpoints Disponibles</h2>
        
        <div class="endpoint">
            <strong>GET /health</strong><br>
            Verificar estado del servidor
        </div>
        
        <div class="endpoint">
            <strong>GET /info</strong><br>
            Información del sistema y proceso
        </div>
        
        <div class="endpoint">
            <strong>GET /api/time</strong><br>
            Obtener timestamp actual
        </div>
        
        <div class="endpoint">
            <strong>POST /api/echo</strong><br>
            Echo del contenido enviado
        </div>

        <h2>🧪 Pruebas</h2>
        <p>Puedes probar los endpoints usando curl:</p>
        <pre><code>curl http://localhost:${this.config.port}/health
curl http://localhost:${this.config.port}/api/time
curl -X POST -H "Content-Type: application/json" -d '{"message":"Hola"}' http://localhost:${this.config.port}/api/echo</code></pre>
    </div>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }

  private handleHealth(req: http.IncomingMessage, res: http.ServerResponse): void {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      isSEA,
      version: '1.0.0'
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(healthData, null, 2));
  }

  private handleInfo(req: http.IncomingMessage, res: http.ServerResponse): void {
    const info = {
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        execPath: process.execPath,
        argv: process.argv,
        cwd: process.cwd(),
        uptime: process.uptime()
      },
      system: {
        isSEA,
        memory: process.memoryUsage(),
        env: {
          NODE_ENV: process.env.NODE_ENV || 'production',
          PORT: process.env.PORT || 'default'
        }
      },
      server: {
        host: this.config.host,
        port: this.config.port,
        timestamp: new Date().toISOString()
      }
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(info, null, 2));
  }

  private handleTime(req: http.IncomingMessage, res: http.ServerResponse): void {
    const timeData = {
      timestamp: new Date().toISOString(),
      unixTime: Math.floor(Date.now() / 1000),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isSEA
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(timeData, null, 2));
  }

  private handleEcho(req: http.IncomingMessage, res: http.ServerResponse): void {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      let parsedBody: any;
      try {
        parsedBody = JSON.parse(body);
      } catch (e) {
        parsedBody = { raw: body };
      }

      const response = {
        echo: parsedBody,
        received: new Date().toISOString(),
        from: req.socket.remoteAddress,
        isSEA,
        headers: req.headers
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response, null, 2));
    });
  }

  private handleNotFound(req: http.IncomingMessage, res: http.ServerResponse): void {
    const notFoundData = {
      error: 'Not Found',
      message: `La ruta ${req.url} no existe`,
      timestamp: new Date().toISOString(),
      isSEA
    };

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(notFoundData, null, 2));
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.config.port, this.config.host, () => {
        console.log(`🚀 Servidor iniciado en http://${this.config.host}:${this.config.port}`);
        console.log(`📦 Modo SEA: ${isSEA ? 'Sí' : 'No'}`);
        console.log(`🕒 Iniciado: ${new Date().toISOString()}`);
        console.log(`📍 PID: ${process.pid}`);
        console.log(`📋 Plataforma: ${process.platform} (${process.arch})`);
        console.log(`⚡ Node.js: ${process.version}`);
        console.log('---');
        resolve();
      });

      this.server.on('error', (err) => {
        reject(err);
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log('🛑 Servidor detenido');
        resolve();
      });
    });
  }
}

// Función principal
async function main() {
  // Configuración desde variables de entorno o valores por defecto
  const config: ServerConfig = {
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0'
  };

  const server = new SimpleServer(config);

  // Manejo de señales para shutdown graceful
  process.on('SIGINT', async () => {
    console.log('\n🔄 Recibida señal SIGINT, deteniendo servidor...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🔄 Recibida señal SIGTERM, deteniendo servidor...');
    await server.stop();
    process.exit(0);
  });

  // Manejo de errores no capturados
  process.on('uncaughtException', (err) => {
    console.error('❌ Error no capturado:', err);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
    process.exit(1);
  });

  try {
    await server.start();
    console.log('✅ Servidor listo para recibir conexiones');
    console.log('🌐 Visita http://localhost:' + config.port + ' en tu navegador');
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Verificar si estamos corriendo como módulo principal
if (require.main === module) {
  main().catch(console.error);
}

export { SimpleServer, ServerConfig };