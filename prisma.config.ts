import { defineConfig } from '@prisma/config'

export default defineConfig({
  earlyAccess: true,
  studio: {
    port: 5555,
  },
  migrations: {
    schemaPath: 'prisma/schema.prisma',
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
})
