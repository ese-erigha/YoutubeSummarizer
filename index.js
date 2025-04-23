// Frontend-only entry point
import { createServer } from 'vite';

async function startServer() {
  const server = await createServer({
    // Use Vite's default server configuration
    server: {
      port: 3000,
      host: '0.0.0.0', // Listen on all network interfaces
    },
  });
  
  await server.listen();
  
  const info = server.config.logger.info;
  info(`🚀 Server running at ${server.resolvedUrls.local[0]}`);
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});