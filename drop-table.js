require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "DocumentChunk";');
  console.log('Table dropped');
}

run().catch(console.error).finally(() => prisma.$disconnect());
