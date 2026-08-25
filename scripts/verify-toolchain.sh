#!/usr/bin/env bash
# verify-toolchain.sh — CI drift guards for the toolchain-consistency set.
#
# Each check keeps the runtime/CI toolchain consistent with the versions
# declared in package.json / tsconfig.json:
#   check_corepack_pin        Dockerfile corepack pin == packageManager
#   check_node_image          Dockerfile node image satisfies engines.node
#   check_ts_target           typescript devDependency supports tsconfig target
#   check_setup_node          CI setup-node versions match Dockerfile + engines.node
#   check_pnpm_action_setup   CI pnpm/action-setup version input == packageManager
#
# Usage:
#   scripts/verify-toolchain.sh                # run all checks
#   scripts/verify-toolchain.sh --list         # list check names
#   scripts/verify-toolchain.sh <check>        # run a single check
#
# Every check is a pure function of the file paths it reads (defaulting to
# the repository's real files), so the logic is unit-testable in isolation:
#   source scripts/verify-toolchain.sh
#   check_ts_target /tmp/fixtures/package.json /tmp/fixtures/tsconfig.json
# Checks return 0 on success and 1 on failure (printing ::error:: lines that
# GitHub Actions surfaces on the failing step).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

PKG="${PKG:-$ROOT_DIR/package.json}"
DOCKERFILE="${DOCKERFILE:-$ROOT_DIR/Dockerfile}"
TSCONFIG="${TSCONFIG:-$ROOT_DIR/tsconfig.json}"
WORKFLOW="${WORKFLOW:-$ROOT_DIR/.github/workflows/ci.yml}"

CHECKS=(check_corepack_pin check_node_image check_ts_target check_setup_node check_pnpm_action_setup)

check_corepack_pin() {
  local pkg="${1:-$PKG}" dockerfile="${2:-$DOCKERFILE}"
  local declared pinned
  declared=$(grep -Eo '"packageManager"[^,]*' "$pkg" | sed -E 's/.*"([^"]+)".*/\1/' | cut -d'+' -f1)
  pinned=$(grep -Eo 'corepack prepare [^ ]+ --activate' "$dockerfile" | awk '{print $3}')
  if [ -z "$pinned" ]; then
    echo "::error::Could not find a 'corepack prepare pnpm@X --activate' pin in Dockerfile"
    return 1
  fi
  if [ "$declared" != "$pinned" ]; then
    echo "::error::Dockerfile corepack pin '$pinned' does not match packageManager '$declared'. Keep them in sync."
    return 1
  fi
  echo "✓ Dockerfile corepack pin ($pinned) matches packageManager ($declared)"
}

check_node_image() {
  local pkg="${1:-$PKG}" dockerfile="${2:-$DOCKERFILE}"
  local image_major range min_major
  image_major=$(grep -Eo 'FROM node:[0-9]+' "$dockerfile" | head -1 | grep -Eo '[0-9]+')
  range=$(grep -Eo '"node": *"[^"]*"' "$pkg" | sed -E 's/.*"([^"]*)"/\1/')
  if [ -z "$image_major" ]; then
    echo "::error::Could not find a 'FROM node:<major>-alpine' base image in Dockerfile"
    return 1
  fi
  # Support the common '>=X' ranges; anything else is treated as a mismatch
  # so the check stays conservative.
  if ! echo "$range" | grep -Eq '^>=[0-9]+(\.[0-9]+)*$'; then
    echo "::error::Unsupported engines.node range '$range'. Only '>=X' ranges are supported by this check."
    return 1
  fi
  min_major=$(echo "$range" | sed -E 's/^>=([0-9]+).*/\1/')
  if [ "$image_major" -lt "$min_major" ]; then
    echo "::error::Dockerfile node image (node:${image_major}-alpine) does not satisfy engines.node '$range' in package.json"
    return 1
  fi
  echo "✓ Dockerfile node image (node:${image_major}-alpine) satisfies engines.node ($range)"
}

check_ts_target() {
  local pkg="${1:-$PKG}" tsconfig="${2:-$TSCONFIG}"
  local ts_ver target ts_major ts_minor req_major req_minor
  ts_ver=$(grep -Eo '"typescript": *"[^"]*"' "$pkg" | sed -E 's/.*"([^"]*)".*/\1/')
  target=$(grep -Eo '"target": *"[^"]*"' "$tsconfig" | sed -E 's/.*"([^"]*)".*/\1/')
  if [ -z "$ts_ver" ] || [ -z "$target" ]; then
    echo "::error::Could not read typescript version from package.json or target from tsconfig.json"
    return 1
  fi
  # Strip common range prefixes (^ ~ >=) to get the bare version.
  ts_ver=$(echo "$ts_ver" | sed -E 's/^(\^|~|>=)+//')
  ts_major=$(echo "$ts_ver" | cut -d. -f1)
  ts_minor=$(echo "$ts_ver" | cut -d. -f2)
  # Minimum TypeScript version that supports each target (from the TypeScript
  # release notes): ES2022=4.6, ES2023=5.2, ES2024=5.5.
  case "$target" in
    ES2024) req_major=5; req_minor=5 ;;
    ES2023) req_major=5; req_minor=2 ;;
    ES2022) req_major=4; req_minor=6 ;;
    ESNext|ES2021|ES2020|ES2019|ES2018|ES2017|ES2016|ES2015|ES6|ES5|ES3) req_major=0; req_minor=0 ;;
    *) echo "::error::Unsupported tsconfig target '$target'. Update this check or use a known target."; return 1 ;;
  esac
  if [ "$ts_major" -lt "$req_major" ] || { [ "$ts_major" -eq "$req_major" ] && [ "$ts_minor" -lt "$req_minor" ]; }; then
    echo "::error::TypeScript $ts_ver does not support tsconfig target '$target' (requires >=$req_major.$req_minor)"
    return 1
  fi
  echo "✓ TypeScript $ts_ver supports tsconfig target ($target)"
}

check_setup_node() {
  local workflow="${1:-$WORKFLOW}" pkg="${2:-$PKG}" dockerfile="${3:-$DOCKERFILE}"
  local ci_versions image_major range min_major v v_major failed=0
  ci_versions=""
  while IFS= read -r v; do
    v=$(echo "$v" | sed -E 's/node-version: *"([^"]*)"/\1/')
    ci_versions="$ci_versions $v"
  done < <(grep -Eo 'node-version: *"[^"]*"' "$workflow")

  image_major=$(grep -Eo 'FROM node:[0-9]+' "$dockerfile" | head -1 | grep -Eo '[0-9]+')
  range=$(grep -Eo '"node": *"[^"]*"' "$pkg" | sed -E 's/.*"([^"]*)"/\1/')

  if [ -z "${ci_versions// /}" ]; then
    echo "::error::No node-version found in the CI workflow's setup-node steps"
    return 1
  fi
  if [ -z "$image_major" ]; then
    echo "::error::Could not find a 'FROM node:<major>' base image in Dockerfile"
    return 1
  fi
  if ! echo "$range" | grep -Eq '^>=[0-9]+(\.[0-9]+)*$'; then
    echo "::error::Unsupported engines.node range '$range'. Only '>=X' ranges are supported by this check."
    return 1
  fi
  min_major=$(echo "$range" | sed -E 's/^>=([0-9]+).*/\1/')

  for v in $ci_versions; do
    v_major=$(echo "$v" | cut -d. -f1)
    if [ "$v_major" != "$image_major" ]; then
      echo "::error::CI setup-node version '$v' (major $v_major) does not match Dockerfile node image (node:${image_major}-alpine)"
      failed=1
    fi
    if [ "$v_major" -lt "$min_major" ]; then
      echo "::error::CI setup-node version '$v' (major $v_major) does not satisfy engines.node '$range' in package.json"
      failed=1
    fi
  done

  if [ "$failed" -ne 0 ]; then
    return 1
  fi
  echo "✓ All CI setup-node versions ($ci_versions) match Dockerfile node:${image_major}-alpine and satisfy engines.node ($range)"
}

check_pnpm_action_setup() {
  local workflow="${1:-$WORKFLOW}" pkg="${2:-$PKG}"
  local declared declared_ver pinned failed=0 v
  declared=$(grep -Eo '"packageManager"[^,]*' "$pkg" | sed -E 's/.*"([^"]+)".*/\1/' | cut -d'+' -f1)
  declared_ver=$(echo "$declared" | sed -E 's/^pnpm@//')
  if [ -z "$declared" ]; then
    echo "::error::Could not read packageManager from package.json"
    return 1
  fi
  # Explicit `version:` inputs on pnpm/action-setup steps (anchored so
  # setup-node's `node-version:` can never match).
  pinned=$(grep -A 3 'uses: pnpm/action-setup' "$workflow" | grep -Eo '^[[:space:]]*version: *"[^"]*"' | sed -E 's/.*"([^"]*)"/\1/')
  if [ -n "$pinned" ]; then
    for v in $pinned; do
      if [ "$v" != "$declared_ver" ]; then
        echo "::error::pnpm/action-setup version '$v' does not match packageManager '$declared'. Remove the version input so CI resolves packageManager, or keep it in sync."
        failed=1
      fi
    done
    if [ "$failed" -ne 0 ]; then
      return 1
    fi
    echo "✓ pnpm/action-setup version ($pinned) matches packageManager ($declared)"
  else
    echo "✓ pnpm/action-setup resolves pnpm from packageManager ($declared)"
  fi
}

main() {
  local cmd="${1:-all}"
  case "$cmd" in
    all)
      local failed=0 c
      for c in "${CHECKS[@]}"; do
        echo "== $c =="
        if ! "$c"; then
          failed=1
        fi
      done
      exit "$failed"
      ;;
    --list)
      printf '%s\n' "${CHECKS[@]}"
      ;;
    *)
      if printf '%s\n' "${CHECKS[@]}" | grep -qx "$cmd"; then
        "$cmd"
        exit "$?"
      fi
      echo "usage: $0 [--list|all|<check>]" >&2
      echo "checks: ${CHECKS[*]}" >&2
      exit 2
      ;;
  esac
}

if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then
  main "$@"
fi