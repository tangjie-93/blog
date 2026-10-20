#!/usr/bin/env sh

set -eu

BACKEND_PORT="${BACKEND_PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT="$SCRIPT_DIR"
FRONTEND_ROOT="$PROJECT_ROOT/frontend"

RUN_LOG_DIR="${TMPDIR:-/tmp}/stage4-fullstack"
mkdir -p "$RUN_LOG_DIR"

BACKEND_OUT="$RUN_LOG_DIR/backend.out"
BACKEND_ERR="$RUN_LOG_DIR/backend.err"
FRONTEND_OUT="$RUN_LOG_DIR/frontend.out"
FRONTEND_ERR="$RUN_LOG_DIR/frontend.err"

: >"$BACKEND_OUT"
: >"$BACKEND_ERR"
: >"$FRONTEND_OUT"
: >"$FRONTEND_ERR"

rm -f \
  "$PROJECT_ROOT/backend-dev.log" \
  "$PROJECT_ROOT/backend-dev.err.log" \
  "$PROJECT_ROOT/frontend-dev.log" \
  "$PROJECT_ROOT/frontend-dev.err.log"

if [ -t 1 ]; then
  BOLD=$(printf '\033[1m')
  DIM=$(printf '\033[2m')
  GREEN=$(printf '\033[32m')
  CYAN=$(printf '\033[36m')
  YELLOW=$(printf '\033[33m')
  RESET=$(printf '\033[0m')
else
  BOLD=""
  DIM=""
  GREEN=""
  CYAN=""
  YELLOW=""
  RESET=""
fi

find_command() {
  for name in "$@"; do
    if command -v "$name" >/dev/null 2>&1; then
      command -v "$name"
      return 0
    fi
  done
  return 1
}

is_port_in_use() {
  port="$1"
  netstat -ano 2>/dev/null \
    | tr -d '\r' \
    | awk -v port=":$port" '$0 ~ port && $4 == "LISTENING" { found = 1 } END { exit found ? 0 : 1 }'
}

find_available_port() {
  label="$1"
  start_port="$2"
  AVAILABLE_PORT="$start_port"
  while is_port_in_use "$AVAILABLE_PORT"; do
    printf '%s%s%s port %s is occupied. Trying %s...%s\n' "$YELLOW" "$BOLD" "$label" "$AVAILABLE_PORT" "$((AVAILABLE_PORT + 1))" "$RESET"
    AVAILABLE_PORT=$((AVAILABLE_PORT + 1))
    if [ "$AVAILABLE_PORT" -gt 65535 ]; then
      echo "No available backend port was found." >&2
      exit 1
    fi
  done
}

wait_for_port() {
  port="$1"
  timeout_seconds="$2"
  elapsed=0

  while [ "$elapsed" -lt "$timeout_seconds" ]; do
    if is_port_in_use "$port"; then
      return 0
    fi
    sleep 1
    elapsed=$((elapsed + 1))
  done

  return 1
}

print_log_file() {
  label="$1"
  file="$2"

  if [ -s "$file" ]; then
    printf '\n%s%s%s%s\n' "$YELLOW" "$BOLD" "$label" "$RESET" >&2
    sed -n '1,120p' "$file" >&2
  fi
}

MVN_CMD=$(find_command mvn mvn.cmd || true)
if [ -z "$MVN_CMD" ]; then
  echo "mvn or mvn.cmd was not found. Please install Maven and add it to PATH." >&2
  exit 1
fi

NODE_RUNNER=$(find_command pnpm pnpm.cmd npm npm.cmd || true)
if [ -z "$NODE_RUNNER" ]; then
  echo "pnpm/npm was not found. Please install Node.js first." >&2
  exit 1
fi

find_available_port "Backend" "$BACKEND_PORT"
BACKEND_PORT="$AVAILABLE_PORT"
BACKEND_URL="http://localhost:$BACKEND_PORT/stage4/"
BACKEND_TARGET="http://localhost:$BACKEND_PORT"
find_available_port "Frontend" "$FRONTEND_PORT"
FRONTEND_PORT="$AVAILABLE_PORT"
FRONTEND_URL="http://localhost:$FRONTEND_PORT/"

printf '\n%s%sStarting full stack...%s\n' "$GREEN" "$BOLD" "$RESET"
printf '%sBackend:%s  %s\n' "$CYAN" "$RESET" "$BACKEND_URL"
printf '%sFrontend:%s %s\n\n' "$CYAN" "$RESET" "$FRONTEND_URL"

(
  cd "$PROJECT_ROOT"
  "$MVN_CMD" spring-boot:run "-Dspring-boot.run.arguments=--server.port=$BACKEND_PORT"
) >"$BACKEND_OUT" 2>"$BACKEND_ERR" &
BACKEND_PID=$!

(
  cd "$FRONTEND_ROOT"
  VITE_BACKEND_TARGET="$BACKEND_TARGET" VITE_FRONTEND_PORT="$FRONTEND_PORT" "$NODE_RUNNER" run dev
) >"$FRONTEND_OUT" 2>"$FRONTEND_ERR" &
FRONTEND_PID=$!

cleanup() {
  printf '\n%sStopping services...%s\n' "$DIM" "$RESET"
  kill "$BACKEND_PID" "$FRONTEND_PID" >/dev/null 2>&1 || true
}

trap cleanup INT TERM EXIT

if ! wait_for_port "$FRONTEND_PORT" 20; then
  printf '%s%sFrontend failed to start on port %s.%s\n' "$YELLOW" "$BOLD" "$FRONTEND_PORT" "$RESET" >&2
  print_log_file "frontend stdout:" "$FRONTEND_OUT"
  print_log_file "frontend stderr:" "$FRONTEND_ERR"
  printf '\n%sTry running this manually for the full error:%s\n' "$DIM" "$RESET" >&2
  printf 'cd "%s" && pnpm run dev\n' "$FRONTEND_ROOT" >&2
  exit 1
fi

printf '%s%sReady links:%s\n' "$GREEN" "$BOLD" "$RESET"
printf '  %s%sFrontend:%s %s\n' "$GREEN" "$BOLD" "$RESET" "$FRONTEND_URL"
printf '  %s%sBackend:%s  %s\n' "$GREEN" "$BOLD" "$RESET" "$BACKEND_URL"
printf '\n%sProcess IDs:%s backend=%s frontend=%s\n' "$DIM" "$RESET" "$BACKEND_PID" "$FRONTEND_PID"
if wait_for_port "$BACKEND_PORT" 3; then
  printf '%sBackend is listening on port %s.%s\n' "$DIM" "$BACKEND_PORT" "$RESET"
else
printf '%sBackend is still starting. Maven download, compilation, or MySQL initialization may take longer.%s\n' "$YELLOW" "$RESET"
fi
printf '%sIf the page or API is not ready yet, wait 10-30 seconds and refresh.%s\n' "$DIM" "$RESET"
printf '%sKeep this terminal open. Press Ctrl+C to stop both services.%s\n' "$DIM" "$RESET"

wait
