#!/usr/bin/env bash
# Unit tests for scripts/verify-toolchain.sh.
#
# Each check is a pure function of the file paths it reads, so these tests
# point them at fixture files in a temp dir and assert the exit code (0 =
# toolchain consistent, 1 = drift detected).
#
# Run: bash scripts/verify-toolchain.test.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=verify-toolchain.sh
source "$SCRIPT_DIR/verify-toolchain.sh"

PASS=0
FAIL=0

# assert_exit <expected> <desc> <cmd...>
assert_exit() {
  local expected="$1" desc="$2"
  shift 2
  local actual
  ( "$@" ) >/dev/null 2>&1
  actual=$?
  if [ "$actual" -eq "$expected" ]; then
    PASS=$((PASS + 1))
    echo "ok   - $desc"
  else
    FAIL=$((FAIL + 1))
    echo "FAIL - $desc (expected exit $expected, got $actual)"
  fi
}

FIXTURES="$(mktemp -d)"
trap 'rm -rf "$FIXTURES"' EXIT

# --- Good fixtures (everything consistent) --------------------------------
cat > "$FIXTURES/package.json" <<'EOF'
{
  "packageManager": "pnpm@11.20.0",
  "engines": { "node": ">=22.22.0" },
  "devDependencies": { "typescript": "^7.0.0" }
}
EOF

cat > "$FIXTURES/Dockerfile" <<'EOF'
FROM node:24-alpine
RUN corepack prepare pnpm@11.20.0 --activate
EOF

cat > "$FIXTURES/tsconfig.json" <<'EOF'
{ "compilerOptions": { "target": "ES2022" } }
EOF

cat > "$FIXTURES/ci.yml" <<'EOF'
steps:
  - uses: pnpm/action-setup@abc # v6.0.10
  - uses: actions/setup-node@v7
    with:
      node-version: "24"
EOF

# Drift fixtures -----------------------------------------------------------
cat > "$FIXTURES/Dockerfile.drift" <<'EOF'
FROM node:24-alpine
RUN corepack prepare pnpm@10.34.5 --activate
EOF

cat > "$FIXTURES/Dockerfile.no-pin" <<'EOF'
FROM node:24-alpine
EOF

cat > "$FIXTURES/Dockerfile.node20" <<'EOF'
FROM node:20-alpine
RUN corepack prepare pnpm@11.20.0 --activate
EOF

cat > "$FIXTURES/package.node20" <<'EOF'
{ "packageManager": "pnpm@11.20.0", "engines": { "node": ">=22.22.0" } }
EOF

cat > "$FIXTURES/package.range-caret" <<'EOF'
{ "packageManager": "pnpm@11.20.0", "engines": { "node": "^22.0.0" } }
EOF

cat > "$FIXTURES/package.ts54" <<'EOF'
{ "packageManager": "pnpm@11.20.0", "devDependencies": { "typescript": "^5.4.5" } }
EOF

cat > "$FIXTURES/tsconfig.es2024" <<'EOF'
{ "compilerOptions": { "target": "ES2024" } }
EOF

cat > "$FIXTURES/tsconfig.es2099" <<'EOF'
{ "compilerOptions": { "target": "ES2099" } }
EOF

cat > "$FIXTURES/ci.node20" <<'EOF'
steps:
  - uses: pnpm/action-setup@abc # v6.0.10
  - uses: actions/setup-node@v7
    with:
      node-version: "20"
EOF

cat > "$FIXTURES/ci.pnpm-drift" <<'EOF'
steps:
  - uses: pnpm/action-setup@abc # v6.0.10
    with:
      version: "9.0.0"
  - uses: actions/setup-node@v7
    with:
      node-version: "24"
EOF

cat > "$FIXTURES/ci.pnpm-match" <<'EOF'
steps:
  - uses: pnpm/action-setup@abc # v6.0.10
    with:
      version: "11.20.0"
  - uses: actions/setup-node@v7
    with:
      node-version: "24"
EOF

# check_corepack_pin -------------------------------------------------------
assert_exit 0 "corepack pin matches packageManager" \
  check_corepack_pin "$FIXTURES/package.json" "$FIXTURES/Dockerfile"
assert_exit 1 "corepack pin drifts from packageManager" \
  check_corepack_pin "$FIXTURES/package.json" "$FIXTURES/Dockerfile.drift"
assert_exit 1 "corepack pin missing" \
  check_corepack_pin "$FIXTURES/package.json" "$FIXTURES/Dockerfile.no-pin"

# check_node_image ----------------------------------------------------------
assert_exit 0 "node image satisfies engines.node" \
  check_node_image "$FIXTURES/package.json" "$FIXTURES/Dockerfile"
assert_exit 1 "node image below engines.node minimum" \
  check_node_image "$FIXTURES/package.node20" "$FIXTURES/Dockerfile.node20"
assert_exit 1 "unsupported engines.node range (caret)" \
  check_node_image "$FIXTURES/package.caret" "$FIXTURES/Dockerfile"

# check_ts_target -----------------------------------------------------------
assert_exit 0 "typescript version supports target" \
  check_ts_target "$FIXTURES/package.json" "$FIXTURES/tsconfig.json"
assert_exit 1 "typescript below target minimum (ES2024 needs 5.5)" \
  check_ts_target "$FIXTURES/package.ts54" "$FIXTURES/tsconfig.es2024"
assert_exit 1 "unsupported tsconfig target" \
  check_ts_target "$FIXTURES/package.json" "$FIXTURES/tsconfig.es2099"

# check_setup_node ----------------------------------------------------------
assert_exit 0 "setup-node versions match Dockerfile + engines" \
  check_setup_node "$FIXTURES/ci.yml" "$FIXTURES/package.json" "$FIXTURES/Dockerfile"
assert_exit 1 "setup-node version below engines.node minimum" \
  check_setup_node "$FIXTURES/ci.node20" "$FIXTURES/package.json" "$FIXTURES/Dockerfile"

# check_pnpm_action_setup ---------------------------------------------------
assert_exit 0 "no pnpm/action-setup version input (resolves packageManager)" \
  check_pnpm_action_setup "$FIXTURES/ci.yml" "$FIXTURES/package.json"
assert_exit 0 "matching pnpm/action-setup version input" \
  check_pnpm_action_setup "$FIXTURES/ci.pnpm-match" "$FIXTURES/package.json"
assert_exit 1 "pnpm/action-setup version input drifts from packageManager" \
  check_pnpm_action_setup "$FIXTURES/ci.pnpm-drift" "$FIXTURES/package.json"

echo
echo "passed: $PASS, failed: $FAIL"
[ "$FAIL" -eq 0 ]