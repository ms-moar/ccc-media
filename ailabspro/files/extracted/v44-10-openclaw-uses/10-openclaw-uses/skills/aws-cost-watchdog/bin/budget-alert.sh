#!/bin/bash
# Check AWS Budget status and alert if thresholds breached
# Usage: budget-alert.sh [budget-name]

set -euo pipefail

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BUDGET_NAME="${1:-}"

if [ -n "$BUDGET_NAME" ]; then
  aws budgets describe-budget \
    --account-id "$ACCOUNT_ID" \
    --budget-name "$BUDGET_NAME" \
    --output json | jq '{
      name: .Budget.BudgetName,
      limit_usd: .Budget.BudgetLimit.Amount,
      actual_usd: (.Budget.CalculatedSpend.ActualSpend.Amount // "0"),
      forecast_usd: (.Budget.CalculatedSpend.ForecastedSpend.Amount // "N/A"),
      pct_used: (
        ((.Budget.CalculatedSpend.ActualSpend.Amount // "0") | tonumber) /
        ((.Budget.BudgetLimit.Amount // "1") | tonumber) * 100 | round
      )
    }'
else
  aws budgets describe-budgets \
    --account-id "$ACCOUNT_ID" \
    --output json | jq '[.Budgets[] | {
      name: .BudgetName,
      limit_usd: .BudgetLimit.Amount,
      actual_usd: (.CalculatedSpend.ActualSpend.Amount // "0"),
      forecast_usd: (.CalculatedSpend.ForecastedSpend.Amount // "N/A"),
      pct_used: (
        ((.CalculatedSpend.ActualSpend.Amount // "0") | tonumber) /
        ((.BudgetLimit.Amount // "1") | tonumber) * 100 | round
      )
    }]'
fi
