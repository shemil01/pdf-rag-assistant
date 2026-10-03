import * as dotenv from 'dotenv';
dotenv.config();

import prisma from './src/lib/db/prisma';

async function run() {
  await prisma.$executeRawUnsafe('DROP TABLE IF EXISTS "DocumentChunk";');
  console.log('Table dropped');
}

run().catch(console.error).finally(() => prisma.$disconnect());
