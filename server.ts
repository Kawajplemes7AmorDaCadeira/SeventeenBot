import express from 'express';
import { startBot, client } from './src/index.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('*', (req, res) => {
    res.send('<h1>Discord Bot is running!</h1><p>This is a headless bot application.</p>');
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error('Port 3000 is already in use. The previous process might still be shutting down.');
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });

  // Start the Discord Bot asynchronously
  startBot().then(() => {
    console.log('Discord bot initialized successfully.');
  }).catch((error) => {
    console.error('Failed to start Discord bot:', error);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('Shutting down gracefully...');
    if (client) {
      client.destroy();
      console.log('Discord client destroyed.');
    }
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });

    // Force exit after 2 seconds if server.close() hangs
    setTimeout(() => {
      console.error('Forcing shutdown...');
      process.exit(1);
    }, 2000).unref();
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
