/**
 * setup-database.mjs — Switch Prisma schema between database providers.
 *
 * Usage:
 *   node scripts/setup-database.mjs                  # uses DATABASE_TYPE env var (default: postgresql)
 *   DATABASE_TYPE=mysql node scripts/setup-database.mjs
 *
 * Supported DATABASE_TYPE: postgresql, mysql, sqlite
 *
 * This script copies the appropriate schema.*.prisma file to prisma/schema.prisma
 * and prints the recommended DATABASE_URL.
 */

import { copyFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const VALID_TYPES = ['postgresql', 'mysql', 'sqlite'];

const DATABASE_URLS = {
  postgresql: 'postgresql://postgres:postgres@localhost:5432/cybersec_lab?schema=public',
  mysql: 'mysql://root:password@localhost:3306/cybersec_lab',
  sqlite: 'file:./dev.db',
};

function main() {
  const dbType = (process.env.DATABASE_TYPE || 'postgresql').toLowerCase();

  if (!VALID_TYPES.includes(dbType)) {
    process.stderr.write(
      `Error: Unknown DATABASE_TYPE "${dbType}". Valid types: ${VALID_TYPES.join(', ')}\n`
    );
    process.exit(1);
  }

  const sourceFile = join(rootDir, 'prisma', `schema.${dbType}.prisma`);
  const targetFile = join(rootDir, 'prisma', 'schema.prisma');

  if (!existsSync(sourceFile)) {
    process.stderr.write(`Error: Schema file not found: ${sourceFile}\n`);
    process.exit(1);
  }

  copyFileSync(sourceFile, targetFile);

  const recommendedUrl = DATABASE_URLS[dbType];

  process.stdout.write(`\n  Database type: ${dbType}\n`);
  process.stdout.write(`  Schema updated: prisma/schema.prisma\n`);
  process.stdout.write(`  Recommended DATABASE_URL: ${recommendedUrl}\n\n`);

  if (dbType === 'sqlite') {
    process.stdout.write('  Tip: Run "bun run db:sqlite" to generate client and push schema.\n\n');
  }
}

main();
