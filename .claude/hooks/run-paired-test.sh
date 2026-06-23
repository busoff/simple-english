#!/usr/bin/env bash
# PostToolUse hook: after editing a .js file, run its paired .test.js (if any).
# Non-blocking — prints result to stderr, always exits 0.
# The Stop hook is the hard test gate; this is fast feedback only.

set -u

input="$(cat)"
file_path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"

[ -z "$file_path" ] && exit 0

case "$file_path" in
  *.test.js) test_file="$file_path" ;;
  *.js)      test_file="${file_path%.js}.test.js" ;;
  *)         exit 0 ;;
esac

[ -z "$test_file" ] && exit 0
[ ! -f "$test_file" ] && exit 0

rel="${test_file#$PWD/}"
{
  echo "--- paired test: ${rel} ---"
  npx --no-install vitest run "$test_file" 2>&1
} >&2

exit 0
