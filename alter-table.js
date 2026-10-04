require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  await prisma.$executeRawUnsafe('ALTER TABLE "DocumentChunk" ALTER COLUMN embedding TYPE vector(3072);');
  console.log('Table altered');
}

run().catch(console.error).finally(() => prisma.$disconnect());
