import app from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/database.js';

const PORT = env.PORT;

async function main() {
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (error) {
    console.warn('Database connection failed (non-fatal):', (error as Error).message);
    console.warn('Routes requiring database will not work, but streaming will.');
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${env.NODE_ENV}`);
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

main();
