#!/usr/bin/env node
/**
 * Cross-platform environment loader for Claude Code plugins
 * Works on Windows, Mac, and Linux
 *
 * Checks for .env in order:
 * 1. CLAUDE_PLUGIN_ROOT (plugin directory)
 * 2. CLAUDE_PROJECT_DIR (project directory)
 * 3. Current working directory
 */

const fs = require('fs');
const path = require('path');

// Check multiple locations for .env
const possibleDirs = [
  process.env.CLAUDE_PLUGIN_ROOT,
  process.env.CLAUDE_PROJECT_DIR,
  process.cwd()
].filter(Boolean);

let envFile = null;
let envDir = null;

for (const dir of possibleDirs) {
  const candidate = path.join(dir, '.env');
  if (fs.existsSync(candidate)) {
    envFile = candidate;
    envDir = dir;
    break;
  }
}

if (envFile) {
  const content = fs.readFileSync(envFile, 'utf8');
  const lines = content.split('\n');

  lines.forEach(line => {
    // Skip comments and empty lines
    if (!line || line.startsWith('#')) return;

    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
      process.env[key] = value;
    }
  });

  // Persist to Claude env file if available
  if (process.env.CLAUDE_ENV_FILE && process.env.FATHOM_API_KEY) {
    const exportLine = process.platform === 'win32'
      ? `set FATHOM_API_KEY=${process.env.FATHOM_API_KEY}\n`
      : `export FATHOM_API_KEY="${process.env.FATHOM_API_KEY}"\n`;

    fs.appendFileSync(process.env.CLAUDE_ENV_FILE, exportLine);
    console.log(`Environment loaded from ${envDir} (FATHOM_API_KEY set)`);
  } else {
    console.log(`Environment loaded from ${envDir}`);
  }
} else {
  console.log('Warning: .env not found in plugin or project directory');
  console.log('Checked:', possibleDirs.join(', '));
}

process.exit(0);
