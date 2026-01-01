#!/bin/bash
# Load environment variables and persist them to Claude Code session

# Use CLAUDE_PROJECT_DIR if set, otherwise try to find plugin directory
if [ -n "$CLAUDE_PROJECT_DIR" ]; then
  PROJECT_DIR="$CLAUDE_PROJECT_DIR"
else
  # Fallback: look for .env in current directory or parent
  PROJECT_DIR="$(pwd)"
fi

ENV_FILE="$PROJECT_DIR/.env"

# Load environment variables from .env
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
else
  echo "Warning: .env not found at $ENV_FILE"
  exit 0
fi

# Persist to CLAUDE_ENV_FILE so subsequent bash commands can access them
if [ -n "$CLAUDE_ENV_FILE" ] && [ -n "$FATHOM_API_KEY" ]; then
  echo "export FATHOM_API_KEY=\"$FATHOM_API_KEY\"" >> "$CLAUDE_ENV_FILE"
  echo "Environment loaded (FATHOM_API_KEY set)"
else
  echo "Environment loaded"
fi

exit 0
