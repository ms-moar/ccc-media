---
name: aws-cost-watchdog
description: Monitor AWS spending via Cost Explorer and CloudWatch. Check real-time cloud costs, Bedrock AI usage, and budget alerts.
requires:
  env:
    - AWS_ACCESS_KEY_ID
    - AWS_SECRET_ACCESS_KEY
    - AWS_DEFAULT_REGION
  bins:
    - aws
    - jq
---

# AWS Cost Watchdog

Use this skill when the user asks about AWS costs, cloud spending, budget status, or Bedrock usage.

## Check AWS spending

Get total or per-service costs for today, this week, or this month:

```bash
# Total spend this month
{baseDir}/bin/check-aws-costs.sh month

# Today's spend broken down by service
{baseDir}/bin/check-aws-costs.sh today --by-service

# Last 7 days trend
{baseDir}/bin/check-aws-costs.sh week
```

## Check Bedrock AI usage

See invocation counts and token usage from CloudWatch:

```bash
# Last 24 hours
{baseDir}/bin/check-bedrock-usage.sh 24

# Last 6 hours
{baseDir}/bin/check-bedrock-usage.sh 6
```

## Check budget alerts

See if any AWS Budgets are close to or over their limits:

```bash
# All budgets
{baseDir}/bin/budget-alert.sh

# Specific budget
{baseDir}/bin/budget-alert.sh openclaw-monthly-cap
```

## Create a new budget (one-time)

If the user wants to set up a new AWS budget with email alerts:

```bash
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
aws budgets create-budget \
  --account-id $ACCOUNT_ID \
  --budget "{\"BudgetName\": \"NAME\", \"BudgetLimit\": {\"Amount\": \"AMOUNT\", \"Unit\": \"USD\"}, \"BudgetType\": \"COST\", \"TimeUnit\": \"MONTHLY\"}" \
  --notifications-with-subscribers "[{\"Notification\": {\"NotificationType\": \"ACTUAL\", \"ComparisonOperator\": \"GREATER_THAN\", \"Threshold\": 80, \"ThresholdType\": \"PERCENTAGE\"}, \"Subscribers\": [{\"SubscriptionType\": \"EMAIL\", \"Address\": \"USER_EMAIL\"}]}]"
```

Always confirm the budget name, amount, and email with the user before creating.
