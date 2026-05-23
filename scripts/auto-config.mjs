/**
 * auto-config.mjs — Automatic database configuration with optimal detection.
 *
 * Usage:
 *   node scripts/auto-config.mjs           # auto-detect and configure
 *   node scripts/auto-config.mjs --force   # force re-detection even if .env exists
 *
 * Detection logic:
 *   1. If DATABASE_URL is already set and valid → use it
 *   2. If DATABASE_TYPE is explicitly set → use it
 *   3. Probe for available databases (PostgreSQL:5432, MongoDB:27017, MySQL:3306)
 *   4. Fall back to SQLite if none available
 *
 * Supported databases: postgresql, mysql, sqlite, mongodb
 */

import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createConnection } from 'net';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const VALID_TYPES = ['postgresql', 'mysql', 'sqlite', 'mongodb'];

const DATABASE_URLS = {
  postgresql: 'postgresql://postgres:postgres@localhost:5432/cybersec_lab?schema=public',
  mysql: 'mysql://root:password@localhost:3306/cybersec_lab',
  sqlite: 'file:./prisma/dev.db',
  mongodb: 'mongodb://localhost:27017/cybersec_lab',
};

const DB_PORTS = {
  postgresql: 5432,
  mysql: 3306,
  mongodb: 27017,
};

/** Check if a TCP port is available */
function isPortOpen(port) {
  return new Promise((resolve) => {
    const conn = createConnection({ host: '127.0.0.1', port });
    const timeout = setTimeout(() => { conn.destroy(); resolve(false); }, 500);
    conn.on('connect', () => {
      clearTimeout(timeout);
      conn.destroy();
      resolve(true);
    });
    conn.on('error', () => {
      clearTimeout(timeout);
      resolve(false);
    });
  });
}

/** Parse existing .env and return key-value pairs */
function parseEnv(filePath) {
  if (!existsSync(filePath)) return {};
  const content = readFileSync(filePath, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

/** Detect DATABASE_TYPE from DATABASE_URL */
function detectTypeFromUrl(url) {
  if (!url) return null;
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) return 'postgresql';
  if (url.startsWith('mysql://')) return 'mysql';
  if (url.startsWith('mongodb://') || url.startsWith('mongodb+srv://')) return 'mongodb';
  if (url.startsWith('file:')) return 'sqlite';
  return null;
}

/** Validate DATABASE_URL format */
function isValidUrl(url, type) {
  if (!url) return false;
  switch (type) {
    case 'postgresql': return url.startsWith('postgresql://') || url.startsWith('postgres://');
    case 'mysql': return url.startsWith('mysql://');
    case 'mongodb': return url.startsWith('mongodb://') || url.startsWith('mongodb+srv://');
    case 'sqlite': return url.startsWith('file:');
    default: return false;
  }
}

/** Auto-detect optimal database by probing ports */
async function autoDetect() {
  process.stdout.write('  Probing for available databases...\n');

  // Check all database ports in priority order: PostgreSQL > MongoDB > MySQL
  const results = {};
  for (const [type, port] of Object.entries(DB_PORTS)) {
    const isOpen = await isPortOpen(port);
    results[type] = isOpen;
    process.stdout.write(`    ${type} (port ${port}): ${isOpen ? 'available' : 'not found'}\n`);
  }

  // Return first available, or null for SQLite fallback
  for (const type of ['postgresql', 'mongodb', 'mysql']) {
    if (results[type]) return type;
  }

  process.stdout.write('  No database servers found, falling back to SQLite\n');
  return 'sqlite';
}

/** Copy appropriate schema file for the given database type */
function applySchema(dbType) {
  // MongoDB doesn't use Prisma schema
  if (dbType === 'mongodb') {
    process.stdout.write(`  MongoDB uses Mongoose (no Prisma schema needed)\n`);
    return;
  }

  const sourceFile = join(rootDir, 'prisma', `schema.${dbType}.prisma`);
  const targetFile = join(rootDir, 'prisma', 'schema.prisma');

  if (!existsSync(sourceFile)) {
    process.stderr.write(`Error: Schema file not found: ${sourceFile}\n`);
    process.exit(1);
  }

  copyFileSync(sourceFile, targetFile);
  process.stdout.write(`  Schema updated: prisma/schema.prisma (from ${dbType} variant)\n`);
}

/** Update .env file with detected configuration */
function updateEnv(envPath, env, dbType) {
  const url = DATABASE_URLS[dbType];

  // Update or add DATABASE_TYPE and DATABASE_URL
  env.DATABASE_TYPE = dbType;
  env.DATABASE_URL = url;

  // Reconstruct .env content preserving existing values
  let lines = [];
  if (existsSync(envPath)) {
    lines = readFileSync(envPath, 'utf-8').split('\n');
  }

  const updatedKeys = new Set(['DATABASE_TYPE', 'DATABASE_URL']);
  const newLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      newLines.push(line);
      continue;
    }
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) {
      newLines.push(line);
      continue;
    }
    const key = trimmed.slice(0, eqIdx).trim();
    if (updatedKeys.has(key)) {
      // Skip old DATABASE_TYPE/DATABASE_URL lines — we'll add them at the end
      continue;
    }
    newLines.push(line);
  }

  // Add updated values
  newLines.push('');
  newLines.push(`# Auto-configured database settings`);
  newLines.push(`DATABASE_TYPE=${dbType}`);
  newLines.push(`DATABASE_URL=${url}`);

  writeFileSync(envPath, newLines.join('\n'), 'utf-8');
  process.stdout.write(`  Updated: ${envPath}\n`);
}

async function main() {
  const force = process.argv.includes('--force');
  const envPath = join(rootDir, '.env');
  const env = parseEnv(envPath);

  process.stdout.write('\n  CyberSec Lab Trainer — Auto Configuration\n');
  process.stdout.write('  =========================================\n\n');

  // Step 1: Check if DATABASE_URL is already set and valid
  if (!force && env.DATABASE_URL) {
    const detectedType = detectTypeFromUrl(env.DATABASE_URL);
    if (detectedType && isValidUrl(env.DATABASE_URL, detectedType)) {
      process.stdout.write(`  Existing DATABASE_URL detected (${detectedType})\n`);
      process.stdout.write(`  Using existing configuration. Use --force to re-detect.\n\n`);
      applySchema(detectedType);
      return;
    }
  }

  // Step 2: Check if DATABASE_TYPE is explicitly set
  if (env.DATABASE_TYPE && VALID_TYPES.includes(env.DATABASE_TYPE)) {
    process.stdout.write(`  DATABASE_TYPE=${env.DATABASE_TYPE} explicitly set\n`);
    applySchema(env.DATABASE_TYPE);
    return;
  }

  // Step 3: Auto-detect optimal database
  process.stdout.write(`  No valid database configuration found.\n`);
  process.stdout.write(`  Auto-detecting optimal configuration...\n\n`);

  const detectedType = await autoDetect();

  // Step 4: Apply configuration
  process.stdout.write(`\n  Selected: ${detectedType}\n`);
  applySchema(detectedType);
  updateEnv(envPath, env, detectedType);

  // Step 5: Print next steps
  process.stdout.write(`\n  Next steps:\n`);
  if (detectedType === 'mongodb') {
    process.stdout.write(`    - MongoDB is configured (uses Mongoose ORM)\n`);
    process.stdout.write(`    - No Prisma setup needed\n`);
    process.stdout.write(`    - Run: npm run dev\n\n`);
  } else if (detectedType === 'sqlite') {
    process.stdout.write(`    - SQLite is configured (local development)\n`);
    process.stdout.write(`    - Run: npm run db:sqlite\n`);
    process.stdout.write(`    - Then: npm run dev\n\n`);
  } else {
    process.stdout.write(`    - ${detectedType} is configured\n`);
    process.stdout.write(`    - Run: npm run db:${detectedType}\n`);
    process.stdout.write(`    - Then: npm run dev\n\n`);
  }
}

main().catch((err) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
