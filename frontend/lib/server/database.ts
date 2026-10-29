/* eslint-disable @typescript-eslint/no-explicit-any -- raw SQL rows are untyped; mappers give them a type */
import { Pool, type PoolConfig } from "pg";

// Hosted databases (Neon via Vercel…) provide a single connection string,
// local development uses the separate DB_* variables.
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const connection: PoolConfig = connectionString
  ? { connectionString }
  : {
      host:     process.env.DB_HOST     || "localhost",
      port:     Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME     || "epsigate_db",
      user:     process.env.DB_USER     || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
    };

function createPool(): Pool {
  const created = new Pool({
    ...connection,
    // Serverless functions run many small instances: keep few connections each
    max: process.env.VERCEL ? 3 : 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    // Force UTF-8 client encoding
    options: "-c client_encoding=UTF8",
  });
  created.on("error", (err) => {
    console.error("PostgreSQL pool error:", err);
  });
  return created;
}

// Reuse one pool across hot reloads in development
const globalForPg = globalThis as unknown as { epsigatePool?: Pool };
export const pool = globalForPg.epsigatePool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForPg.epsigatePool = pool;

export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

export async function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}
