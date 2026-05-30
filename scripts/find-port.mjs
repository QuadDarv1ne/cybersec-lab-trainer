/**
 * find-port.mjs — Cross-platform available port finder and process runner.
 *
 * Usage:
 *   node scripts/find-port.mjs --find              # prints first available port
 *   node scripts/find-port.mjs --run next dev      # finds port, sets env vars, runs command
 *
 * Environment variables:
 *   PORT_START  — starting port (default: 3000)
 *   PORT        — if already set, uses this port directly
 */

import { createServer } from 'net';
import { spawn } from 'child_process';
import { argv, env } from 'process';

const PORT_START = parseInt(env.PORT_START, 10) || 3000;
const MAX_PORT = 65535;

function checkPort(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(port, '127.0.0.1', () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

async function findAvailablePort(startFrom) {
  for (let port = startFrom; port <= MAX_PORT; port++) {
    const available = await checkPort(port);
    if (available) return port;
  }
  throw new Error(`No available port found starting from ${startFrom}`);
}

function main() {
  const args = argv.slice(2);

  if (args[0] === '--find') {
    const startFrom = parseInt(args[1], 10) || PORT_START;
    findAvailablePort(startFrom)
      .then((port) => {
        process.stdout.write(String(port));
      })
      .catch((err) => {
        process.stderr.write(err.message + '\n');
        process.exit(1);
      });
    return;
  }

  if (args[0] === '--run') {
    const command = args.slice(1);
    if (command.length === 0) {
      process.stderr.write('Usage: node scripts/find-port.mjs --run <command> [args...]\n');
      process.exit(1);
    }

    // If PORT is already explicitly set, use it directly
    if (env.PORT) {
      const child = spawn(command[0], command.slice(1), {
        stdio: 'inherit',
        shell: process.platform === 'win32',
      });
      child.on('error', (err) => {
        process.stderr.write(`Failed to start: ${err.message}\n`);
        process.exit(1);
      });
      child.on('exit', (code) => process.exit(code));
      return;
    }

    findAvailablePort(PORT_START)
      .then((port) => {
        // Set PORT
        env.PORT = String(port);

        // Update NEXTAUTH_URL only if it points to localhost:3000 or is not set
        const nextauthUrl = env.NEXTAUTH_URL;
        if (!nextauthUrl || nextauthUrl.includes('localhost:3000')) {
          env.NEXTAUTH_URL = `http://localhost:${port}`;
        }

        const child = spawn(command[0], command.slice(1), {
          stdio: 'inherit',
          shell: process.platform === 'win32',
        });

        child.on('error', (err) => {
          process.stderr.write(`Failed to start: ${err.message}\n`);
          process.exit(1);
        });
        child.on('exit', (code) => process.exit(code));
      })
      .catch((err) => {
        process.stderr.write(err.message + '\n');
        process.exit(1);
      });
    return;
  }

  process.stderr.write(
    'Usage:\n' +
      '  node scripts/find-port.mjs --find [startPort]\n' +
      '  node scripts/find-port.mjs --run <command> [args...]\n'
  );
  process.exit(1);
}

main();
