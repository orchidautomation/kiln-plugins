#!/usr/bin/env node
/**
 * Injects config.yaml content into Claude context
 * Called by UserPromptSubmit hook when /pulse commands are run
 *
 * This eliminates the "searching for config..." chatter
 */

const fs = require('fs');
const path = require('path');

// Check multiple locations for config.yaml
const possibleDirs = [
  process.env.CLAUDE_PLUGIN_ROOT,
  process.env.CLAUDE_PROJECT_DIR,
  process.cwd()
].filter(Boolean);

let configFile = null;

for (const dir of possibleDirs) {
  const candidate = path.join(dir, 'config.yaml');
  if (fs.existsSync(candidate)) {
    configFile = candidate;
    break;
  }
}

if (configFile) {
  const content = fs.readFileSync(configFile, 'utf8');

  // Output in a format Claude will recognize as pre-loaded context
  console.log(`<client-pulse-config>
${content}
</client-pulse-config>

The config.yaml has been pre-loaded above. Use this data directly without searching for the file.`);
} else {
  console.log(`⚠️ No config.yaml found. Run /setup to create one, or copy config.example.yaml to config.yaml`);
}

process.exit(0);
