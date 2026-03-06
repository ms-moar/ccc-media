#!/bin/bash
# Aggregate costs across all configured API providers
# Usage: aggregate-costs.sh
#
# Note: OpenAI and Anthropic usage APIs require ADMIN keys, not regular API keys.
#   OpenAI:    admin key from https://platform.openai.com/settings/organization/admin-keys
#   Anthropic: admin key starting with sk-ant-admin from https://console.anthropic.com/settings/admin-keys

set -uo pipefail

TODAY=$(date -u +%Y-%m-%d)
TOMORROW=$(date -u -d tomorrow +%Y-%m-%d 2>/dev/null || date -u -v+1d +%Y-%m-%d)
MONTH_START=$(date -u +%Y-%m-01)
# Unix timestamp for start of today (GNU date in Docker)
TODAY_EPOCH=$(date -u -d "$TODAY" +%s 2>/dev/null || date -u -j -f "%Y-%m-%d" "$TODAY" +%s)

echo "{"

# 1. OpenClaw internal tracking
echo "  \"openclaw_estimate\": $(openclaw status --usage --json 2>/dev/null || echo '{"error": "openclaw CLI not available"}'),"

# 2. OpenAI (requires admin key)
# Costs API returns amount.value as a float in USD (dollars, not cents)
if [ -n "${OPENAI_ADMIN_KEY:-}" ]; then
  OPENAI_COST=$(curl -s -G "https://api.openai.com/v1/organization/costs" \
    -H "Authorization: Bearer $OPENAI_ADMIN_KEY" \
    -d "start_time=$TODAY_EPOCH" \
    -d "bucket_width=1d" \
    -d "limit=1" 2>/dev/null \
    | jq '[.data[].results[].amount.value] | add // 0 | . * 100 | round / 100' 2>/dev/null || echo "null")
  echo "  \"openai_usd\": $OPENAI_COST,"
elif [ -n "${OPENAI_API_KEY:-}" ]; then
  echo "  \"openai_usd\": \"requires_admin_key (regular API key detected but usage API needs admin key)\","
else
  echo "  \"openai_usd\": \"not_configured\","
fi

# 3. Anthropic (requires admin key)
# Cost Report API returns .results[].amount as a STRING in CENTS — divide by 100 for dollars
if [ -n "${ANTHROPIC_ADMIN_KEY:-}" ]; then
  ANTHROPIC_COST=$(curl -s -G "https://api.anthropic.com/v1/organizations/cost_report" \
    -H "x-api-key: $ANTHROPIC_ADMIN_KEY" \
    -H "anthropic-version: 2023-06-01" \
    -d "starting_at=${MONTH_START}T00:00:00Z" \
    -d "ending_at=${TODAY}T23:59:59Z" \
    -d "bucket_width=1d" 2>/dev/null \
    | jq '[.data[].results[].amount | tonumber] | add // 0 | . / 100 | . * 100 | round / 100' 2>/dev/null || echo "null")
  echo "  \"anthropic_usd\": $ANTHROPIC_COST,"
elif [ -n "${ANTHROPIC_API_KEY:-}" ]; then
  echo "  \"anthropic_usd\": \"requires_admin_key (regular API key detected but cost API needs admin key)\","
else
  echo "  \"anthropic_usd\": \"not_configured\","
fi

# 4. AWS Bedrock (uses standard IAM credentials)
# End must be > Start, so use tomorrow to include today's costs
if aws sts get-caller-identity >/dev/null 2>&1; then
  BEDROCK_COST=$(aws ce get-cost-and-usage \
    --time-period "Start=$MONTH_START,End=$TOMORROW" \
    --granularity MONTHLY \
    --metrics "UnblendedCost" \
    --filter '{"Dimensions":{"Key":"SERVICE","Values":["Amazon Bedrock"]}}' \
    --output json 2>/dev/null \
    | jq '.ResultsByTime[0].Total.UnblendedCost.Amount | tonumber | . * 100 | round / 100' 2>/dev/null || echo "null")
  echo "  \"aws_bedrock_usd\": $BEDROCK_COST"
else
  echo "  \"aws_bedrock_usd\": \"not_configured\""
fi

echo "}"
