#!/bin/bash
# Blocks edits to protected files via Edit/Write (file_path) or Bash (command).
input=$(cat)
target=$(echo "$input" | jq -r '.tool_input.file_path // .tool_input.command // empty')
if echo "$target" | grep -Eq '(\.env|package-lock\.json|pnpm-lock\.yaml)'; then
  echo "Blocked: this touches a protected file (.env / lockfile). Ask the user first." >&2
  exit 2
fi
exit 0