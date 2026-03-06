#!/bin/bash
# AWS Cost Watchdog - check spending across services
# Usage: check-aws-costs.sh [today|week|month] [--by-service]

set -euo pipefail

PERIOD="${1:-month}"
BY_SERVICE="${2:-}"

# Date calculations (macOS + Linux compatible)
TODAY=$(date -u +%Y-%m-%d)
TOMORROW=$(date -u -d tomorrow +%Y-%m-%d 2>/dev/null || date -u -v+1d +%Y-%m-%d)
MONTH_START=$(date -u +%Y-%m-01)

case "$PERIOD" in
  today)
    START="$TODAY"
    END="$TOMORROW"
    GRAN="DAILY"
    ;;
  week)
    START=$(date -u -d '7 days ago' +%Y-%m-%d 2>/dev/null || date -u -v-7d +%Y-%m-%d)
    END="$TOMORROW"
    GRAN="DAILY"
    ;;
  month)
    START="$MONTH_START"
    # End must be > Start; use tomorrow so today is always included
    END="$TOMORROW"
    GRAN="MONTHLY"
    ;;
  *)
    echo "Usage: $0 [today|week|month] [--by-service]"
    exit 1
    ;;
esac

if [ "$BY_SERVICE" = "--by-service" ]; then
  aws ce get-cost-and-usage \
    --time-period "Start=$START,End=$END" \
    --granularity "$GRAN" \
    --metrics "UnblendedCost" \
    --group-by Type=DIMENSION,Key=SERVICE \
    --output json | jq '[.ResultsByTime[].Groups[] | {
      service: .Keys[0],
      cost: (.Metrics.UnblendedCost.Amount | tonumber | . * 100 | round / 100)
    }] | sort_by(-.cost) | .[:15]'
else
  aws ce get-cost-and-usage \
    --time-period "Start=$START,End=$END" \
    --granularity "$GRAN" \
    --metrics "UnblendedCost" \
    --output json | jq '.ResultsByTime[] | {
      period: .TimePeriod.Start,
      cost_usd: (.Total.UnblendedCost.Amount | tonumber | . * 100 | round / 100)
    }'
fi
