import express from 'express';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const staticPath = path.resolve(__dirname, 'public');

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.disable('x-powered-by');

  app.get('/health', (_request, response) => {
    response.status(200).json({
      status: 'ok',
      service: 'recruiter-ai',
      timestamp: new Date().toISOString(),
    });
  });

  app.use(
    express.static(staticPath, {
      index: false,
      maxAge: '1d',
      etag: true,
    })
  );

  // SPA fallback: все клиентские маршруты открывают index.html.
  app.get('*', (_request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    response.sendFile(path.join(staticPath, 'index.html'));
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Recruiter AI is running on port ${PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received. Closing server...`);

    server.close(error => {
      if (error) {
        console.error('Failed to close server cleanly:', error);
        process.exit(1);
      }

      process.exit(0);
    });
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch(error => {
  console.error('Failed to start Recruiter AI:', error);
  process.exit(1);
});