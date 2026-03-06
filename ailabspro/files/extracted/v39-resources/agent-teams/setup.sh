#!/usr/bin/env bash
set -euo pipefail

# Agent Teams — One-command enablement for Claude Code
# Usage: ./setup.sh [--with-hooks]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SETTINGS_FILE="$HOME/.claude/settings.json"
INSTALL_HOOKS=false

for arg in "$@"; do
  case "$arg" in
    --with-hooks) INSTALL_HOOKS=true ;;
    --help|-h)
      echo "Usage: ./setup.sh [--with-hooks]"
      echo ""
      echo "Enables Claude Code Agent Teams (experimental)."
      echo ""
      echo "Options:"
      echo "  --with-hooks   Also install quality-enforcement hooks"
      echo "  --help, -h     Show this help"
      exit 0
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Run ./setup.sh --help for usage."
      exit 1
      ;;
  esac
done

# --- Check Claude Code ---
echo "Checking for Claude Code..."
if command -v claude &>/dev/null; then
  echo "  Found: $(command -v claude)"
else
  echo "  Claude Code not found in PATH."
  echo "  Install it: https://docs.anthropic.com/en/docs/claude-code/overview"
  exit 1
fi

# --- Ensure ~/.claude/ exists ---
mkdir -p "$HOME/.claude"

# --- Backup existing settings ---
if [[ -f "$SETTINGS_FILE" ]]; then
  BACKUP="${SETTINGS_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
  cp "$SETTINGS_FILE" "$BACKUP"
  echo "  Backed up existing settings to: $BACKUP"
fi

# --- Merge agent teams env into settings ---
echo "Enabling agent teams..."

if [[ -f "$SETTINGS_FILE" ]]; then
  existing="$(cat "$SETTINGS_FILE")"
else
  existing="{}"
fi

if command -v jq &>/dev/null; then
  echo "$existing" | jq '
    .env = (.env // {}) + {"CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"}
  ' > "$SETTINGS_FILE"
  echo "  Updated: $SETTINGS_FILE"
elif [[ "$existing" == "{}" ]] || [[ ! -f "$SETTINGS_FILE" ]]; then
  cat > "$SETTINGS_FILE" <<'EOF'
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
EOF
  echo "  Updated: $SETTINGS_FILE"
elif echo "$existing" | grep -q "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS"; then
  echo "  Agent teams already enabled in settings."
else
  echo "  WARNING: jq not installed and settings.json is non-trivial."
  echo "  Please manually add to $SETTINGS_FILE:"
  echo '    "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" }'
  echo ""
  echo "  Or install jq and re-run this script."
fi

# --- Detect tmux ---
if command -v tmux &>/dev/null; then
  echo ""
  echo "  tmux detected. For best experience, consider adding to settings:"
  echo '    "teammateMode": "tmux"'
else
  echo ""
  echo "  Tip: Install tmux for split-pane teammate display."
fi

# --- Optional hook install ---
if [[ "$INSTALL_HOOKS" == true ]]; then
  echo ""
  echo "Installing hooks..."
  if [[ -f "$SCRIPT_DIR/hooks/install-hooks.sh" ]]; then
    bash "$SCRIPT_DIR/hooks/install-hooks.sh" .
  else
    echo "  hooks/install-hooks.sh not found. Skipping."
  fi
fi

# --- Done ---
echo ""
echo "========================================="
echo "  Agent Teams enabled!"
echo "========================================="
echo ""
echo "Test it by starting Claude Code and pasting this prompt:"
echo ""
echo '  Create a team called "test-team" with 2 teammates.'
echo '  Teammate "researcher" should find all TODO comments in this repo.'
echo '  Teammate "reporter" should summarize the findings in a message to the lead.'
echo '  Use the task list to coordinate. Shut down the team when done.'
echo ""
echo "Resources in this folder:"
echo "  CLAUDE.md          — Drop into any project as agent teams rules"
echo "  rules/             — Composable .claude/rules/ drop-ins (alternative to CLAUDE.md)"
echo "  hooks/             — Quality enforcement hook (PreToolUse on TaskUpdate)"
echo "  prompts/           — Workflow recipe templates"
