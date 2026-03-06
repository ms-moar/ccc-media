#!/bin/bash
# Check AWS Bedrock invocation counts and token usage
# Usage: check-bedrock-usage.sh [hours]

set -euo pipefail

HOURS="${1:-24}"

END_TIME=$(date -u +%Y-%m-%dT%H:%M:%S)
START_TIME=$(date -u -d "$HOURS hours ago" +%Y-%m-%dT%H:%M:%S 2>/dev/null \
  || date -u -v-"${HOURS}"H +%Y-%m-%dT%H:%M:%S)

echo "=== Bedrock Invocations (last ${HOURS}h) ==="
aws cloudwatch get-metric-statistics \
  --namespace AWS/Bedrock \
  --metric-name Invocations \
  --start-time "$START_TIME" \
  --end-time "$END_TIME" \
  --period 3600 \
  --statistics Sum \
  --output json | jq '[.Datapoints | sort_by(.Timestamp)[] | {
    time: .Timestamp,
    invocations: .Sum
  }]'

echo ""
echo "=== Bedrock Input Tokens (last ${HOURS}h) ==="
aws cloudwatch get-metric-statistics \
  --namespace AWS/Bedrock \
  --metric-name InputTokenCount \
  --start-time "$START_TIME" \
  --end-time "$END_TIME" \
  --period 3600 \
  --statistics Sum \
  --output json | jq '{
    total_input_tokens: ([.Datapoints[].Sum] | add // 0),
    hourly: [.Datapoints | sort_by(.Timestamp)[] | {time: .Timestamp, tokens: .Sum}]
  }'
