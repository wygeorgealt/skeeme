#!/usr/bin/env bash
set -euo pipefail

# Export Redis keys and values for forensic analysis.
# Usage: sudo bash scripts/export_redis.sh

cd "$(dirname "$0")/.."
ENV_FILE=.env

get_env() {
  grep -m1 "^$1=" "$ENV_FILE" 2>/dev/null || true
}

REDIS_HOST=$(get_env REDIS_HOST | cut -d'=' -f2- | sed "s/^['\"]//;s/['\"]$//" )
REDIS_PORT=$(get_env REDIS_PORT | cut -d'=' -f2- | sed "s/^['\"]//;s/['\"]$//" )
REDIS_PASS=$(get_env REDIS_PASSWORD | cut -d'=' -f2- | sed "s/^['\"]//;s/['\"]$//" )

# Fallbacks
: ${REDIS_HOST:=127.0.0.1}
: ${REDIS_PORT:=6379}

echo "Using Redis host=${REDIS_HOST} port=${REDIS_PORT}"

CLI=redis-cli
if ! command -v redis-cli >/dev/null 2>&1; then
  if command -v docker >/dev/null 2>&1; then
    CLI="docker run --rm redis:7 redis-cli -h ${REDIS_HOST} -p ${REDIS_PORT}"
    echo "redis-cli not found — using dockerized redis-cli"
  else
    echo "ERROR: redis-cli not found and docker not available. Install one of them and re-run." >&2
    exit 1
  fi
fi

OUTDIR=storage/redis_dump_$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p "$OUTDIR"

AUTH_ARGS=()
if [[ -n "$REDIS_PASS" && "$REDIS_PASS" != "null" ]]; then
  AUTH_ARGS+=( -a "$REDIS_PASS" )
fi

echo "Writing keyspace info to $OUTDIR/info.txt"
eval "$CLI" ${AUTH_ARGS[@]} INFO keyspace > "$OUTDIR/info.txt" 2>&1 || true

echo "Scanning for credits_emptied_at:* keys"
eval "$CLI" ${AUTH_ARGS[@]} --scan --pattern 'credits_emptied_at:*' > "$OUTDIR/credits_keys.txt" || true

echo "Summarizing credits keys to $OUTDIR/credits_summary.txt"
while read -r k; do
  [[ -z "$k" ]] && continue
  type=$(eval "$CLI" ${AUTH_ARGS[@]} TYPE "\"$k\"" 2>/dev/null || true)
  ttl=$(eval "$CLI" ${AUTH_ARGS[@]} TTL "\"$k\"" 2>/dev/null || true)
  if [[ "$type" == "string" ]]; then
    val=$(eval "$CLI" ${AUTH_ARGS[@]} GET "\"$k\"" 2>/dev/null || true)
  else
    val="(type:$type)"
  fi
  printf '%s\t%s\tTTL=%s\t%s\n' "$k" "$type" "$ttl" "$val" >> "$OUTDIR/credits_summary.txt"
done < "$OUTDIR/credits_keys.txt"

echo "Starting full Redis dump (this may take time). Output: $OUTDIR/redis_full_dump.txt"
eval "$CLI" ${AUTH_ARGS[@]} --scan | while read -r k; do
  [[ -z "$k" ]] && continue
  type=$(eval "$CLI" ${AUTH_ARGS[@]} TYPE "\"$k\"" 2>/dev/null || true)
  case "$type" in
    string)
      val=$(eval "$CLI" ${AUTH_ARGS[@]} GET "\"$k\"" 2>/dev/null || true)
      ;;
    hash)
      val=$(eval "$CLI" ${AUTH_ARGS[@]} HGETALL "\"$k\"" 2>/dev/null || true)
      ;;
    list)
      val=$(eval "$CLI" ${AUTH_ARGS[@]} LRANGE "\"$k\"" 0 -1 2>/dev/null || true)
      ;;
    set)
      val=$(eval "$CLI" ${AUTH_ARGS[@]} SMEMBERS "\"$k\"" 2>/dev/null || true)
      ;;
    zset)
      val=$(eval "$CLI" ${AUTH_ARGS[@]} ZRANGE "\"$k\"" 0 -1 WITHSCORES 2>/dev/null || true)
      ;;
    *)
      val="(unsupported-type:$type)"
      ;;
  esac
  ttl=$(eval "$CLI" ${AUTH_ARGS[@]} TTL "\"$k\"" 2>/dev/null || true)
  printf '%s\t%s\tTTL=%s\t%s\n' "$k" "$type" "$ttl" "$val" >> "$OUTDIR/redis_full_dump.txt"
done

echo "Redis export complete. Files written to: $OUTDIR"
echo "Copy those files off the server for safekeeping (scp or download via Railway)."

exit 0
