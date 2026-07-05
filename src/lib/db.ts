import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const dbUrl = process.env.DATABASE_URL || 'file:./custom.db'

/**
 * Database client with Turso (libSQL) support for Vercel deployment.
 *
 * - Local dev: uses SQLite file (DATABASE_URL = "file:./custom.db")
 * - Vercel prod: uses Turso (DATABASE_URL = "libsql://nityodin-xxx.turso.io")
 */
function createPrismaClient(): PrismaClient {
  // Use libSQL adapter for remote databases (Turso / Vercel Store)
  if (dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://')) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require('@libsql/client')

    const libsql = createClient({
      url: dbUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    })

    const adapter = new PrismaLibSQL(libsql)
    return new PrismaClient({ adapter } as any)
  }

  // Local SQLite
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

/**
 * Demo mode state. When the database is unavailable (e.g. Vercel without Turso),
 * API routes set this to true and return demo data instead of errors.
 */
export const demoState = { isDemoMode: false }