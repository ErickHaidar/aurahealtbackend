import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

dotenv.config();

async function verifyDeployment() {
  console.log('--- Starting Deployment Verification ---');
  let hasErrors = false;

  console.log('\nChecking Database connection (Prisma/Supabase)...');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ Error: DATABASE_URL environment variable is missing.');
    hasErrors = true;
  } else {
    try {
      const parsedUrl = new URL(databaseUrl);
      if (parsedUrl.password) parsedUrl.password = '****';
      console.log(`Connection URL: ${parsedUrl.toString()}`);
    } catch (err) {
      console.log('Connection URL format could not be parsed.');
    }

    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });

    try {
      await prisma.$connect();
      console.log('✅ Connected to database successfully.');
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database query execution test passed.');
    } catch (err) {
      console.error('❌ Database connection failed:', err.message);
      hasErrors = true;
    } finally {
      await prisma.$disconnect();
    }
  }

  console.log('\nChecking Redis connection (ioredis)...');
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.error('❌ Error: REDIS_URL environment variable is missing.');
    hasErrors = true;
  } else {
    try {
      const parsedUrl = new URL(redisUrl);
      if (parsedUrl.password) parsedUrl.password = '****';
      console.log(`Connection URL: ${parsedUrl.toString()}`);
    } catch (err) {
      console.log('Connection URL format could not be parsed.');
    }

    const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 0,
      connectTimeout: 5000,
    });

    try {
      await redis.ping();
      console.log('✅ Connected to Redis successfully (ping/pong verified).');
    } catch (err) {
      console.error('❌ Redis connection failed:', err.message);
      hasErrors = true;
    } finally {
      await redis.quit();
    }
  }

  console.log('\n--- Verification Summary ---');
  if (hasErrors) {
    console.error('❌ Deployment verification failed.');
    process.exit(1);
  } else {
    console.log('✅ Deployment verification passed successfully!');
    process.exit(0);
  }
}

verifyDeployment();
