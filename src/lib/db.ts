import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const isSQLite = process.env.DATABASE_URL?.startsWith('file:')

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isSQLite
      ? (process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'])
      : (process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db