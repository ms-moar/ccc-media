# Claude Code Proxy — Спецификация v2

## Цель
Полностью прозрачный proxy, эмулирующий Claude Code клиент. Перехватывает ВСЕ запросы (API, OAuth, metrics, feedback). Для Anthropic — неотличим от настоящего Claude Code. Логирует usage для измерения стоимости.

## Архитектура

```
Claude Code (стандартный)
    ↓ DNS/hosts override: api.anthropic.com → localhost
    ↓ DNS/hosts override: platform.claude.com → localhost
Proxy Server (:443 с self-signed TLS)
    ├── ALL requests → forward to real api.anthropic.com / platform.claude.com
    ├── Копирует ВСЕ headers, body, method без изменений
    ├── Логирует usage из response (только /v1/messages)
    └── НЕ модифицирует НИЧЕГО — чистый passthrough
```

### Почему не ANTHROPIC_BASE_URL
`ANTHROPIC_BASE_URL` покрывает только `/v1/messages` и `/v1/messages/count_tokens`. OAuth flow, metrics, feedback, roles — идут на `platform.claude.com` и `api.anthropic.com` напрямую, мимо proxy.

Для полной эмуляции нужен **DNS-level intercept**:
- `/etc/hosts` override или
- Локальный DNS resolver (dnsmasq) или
- Transparent proxy (iptables/pf)

### Маршрутизация
| Домен | Реальный IP | Proxy перехватывает |
|-------|------------|-------------------|
| `api.anthropic.com` | resolve dynamically | ✅ Все запросы |
| `platform.claude.com` | resolve dynamically | ✅ OAuth + success pages |

## Claude Code Internals (из исходников v2.1.87)

### OAuth Flow
- **Authorize URL:** `https://platform.claude.com/oauth/authorize`
- **Token URL:** `https://platform.claude.com/v1/oauth/token`
- **Client ID:** `9d1c250a-e61b-44d9-88ed-5944d1962f5e`
- **Grant types:** `authorization_code`, `refresh_token`
- **Redirect:** `http://localhost:{port}` (local) или `https://platform.claude.com/oauth/code/callback` (manual)
- **Success URL:** `https://platform.claude.com/oauth/code/success?app=claude-code`
- **API Key URL:** `https://api.anthropic.com/api/oauth/claude_cli/create_api_key`
- **Roles URL:** `https://api.anthropic.com/api/oauth/claude_cli/roles`

### Все endpoints (которые proxy должен обрабатывать)

#### API (api.anthropic.com)
| Method | Path | Описание | Логировать usage |
|--------|------|----------|-----------------|
| POST | `/v1/messages` | Основной chat API | ✅ ДА |
| POST | `/v1/messages/count_tokens` | Pre-flight token count | ❌ нет (info only) |
| POST | `/api/oauth/claude_cli/create_api_key` | Создание API key | ❌ |
| GET | `/api/oauth/claude_cli/roles` | Получение ролей | ❌ |
| POST | `/api/claude_cli_feedback` | Feedback | ❌ |
| POST | `/api/claude_code/metrics` | Metrics reporting | ❌ |
| GET | `/api/claude_code/organizations/metrics_enabled` | Org check | ❌ |

#### OAuth (platform.claude.com)
| Method | Path | Описание |
|--------|------|----------|
| GET | `/oauth/authorize` | OAuth authorize redirect |
| POST | `/v1/oauth/token` | Token exchange/refresh |
| GET | `/oauth/code/callback` | Manual redirect callback |
| GET | `/oauth/code/success` | Success page |
| GET | `/buy_credits?...` | Console redirect |

### Headers (Claude Code отправляет)
| Header | Значение | Описание |
|--------|---------|----------|
| `anthropic-version` | `2023-06-01` | API version |
| `anthropic-beta` | varies | Beta features |
| `x-anthropic-billing-header` | `cc_version={ver}; cc_entrypoint={entry};...` | Billing attribution |
| `x-anthropic-additional-protection` | varies | Additional protection |
| `X-Claude-Code-Session-Id` | UUID | Session tracking |
| `User-Agent` | SDK default | НЕ менять! |
| `Authorization` | `Bearer {oauth_token}` | OAuth token |
| `Content-Type` | `application/json` | Request body |
| `Accept` | `text/event-stream` (streaming) | SSE |

### Rate Limit Headers (в response — форвардить as-is)
- `anthropic-ratelimit-unified-status`
- `anthropic-ratelimit-unified-reset`
- `anthropic-ratelimit-unified-{claim}-utilization`
- `anthropic-ratelimit-unified-{claim}-reset`
- `anthropic-ratelimit-unified-overage-status`
- `anthropic-ratelimit-unified-overage-reset`
- `anthropic-ratelimit-unified-overage-disabled-reason`
- `anthropic-ratelimit-unified-representative-claim`
- `anthropic-ratelimit-unified-fallback`

## Proxy Requirements

### Обязательно
1. **Полный passthrough** — НЕ модифицировать запросы/ответы
2. **Все headers копируются as-is** — включая hop-by-hop (Connection, Transfer-Encoding, Keep-Alive)
3. **TLS termination** — proxy принимает HTTPS (self-signed cert, trusted локально), форвардит на реальный HTTPS
4. **Streaming support** — SSE (`text/event-stream`) через tee-stream (см. ниже)
5. **Все домены** — api.anthropic.com + platform.claude.com

### Не делать
- НЕ добавлять свои headers
- НЕ менять User-Agent
- НЕ модифицировать body
- НЕ кешировать запросы
- НЕ retry самостоятельно
- НЕ логировать request body (содержит код/секреты пользователя)
- НЕ логировать Authorization header (redact в debug logs)

## Streaming Architecture

### SSE Usage Extraction
Usage приходит в двух SSE событиях:

```
event: message_start
data: {"type":"message_start","message":{"usage":{"input_tokens":1234,"cache_creation_input_tokens":0,"cache_read_input_tokens":0}}}

...content blocks...

event: message_delta
data: {"type":"message_delta","usage":{"output_tokens":423}}

event: message_stop
data: {"type":"message_stop"}
```

### Tee-Stream Pipeline
```
Anthropic Response
    ↓
Tee (PassThrough)
    ├── Branch A: pipe directly to client (ZERO delay, no buffering)
    └── Branch B: SSE line parser
                    ├── on "message_start" → extract input_tokens, cache tokens
                    ├── on "message_delta" → extract output_tokens
                    └── on "message_stop" → aggregate & write to SQLite
```

### Edge Cases
- **Connection abort before message_stop** → write partial usage (flag `is_complete=false`)
- **Network fragmentation** (SSE chunk split mid-JSON) → line buffer accumulator
- **Non-streaming response** (count_tokens, sync mode) → parse response body JSON directly
- **Error responses** (4xx/5xx) → log status_code, don't parse usage

## TLS Setup

### Self-Signed CA
```bash
# Generate CA (one time)
openssl genrsa -out ca.key 4096
openssl req -new -x509 -days 3650 -key ca.key -out ca.crt -subj "/CN=Claude Code Proxy CA"

# Generate server cert for both domains
openssl req -new -nodes -newkey rsa:2048 -keyout server.key -out server.csr \
  -subj "/CN=api.anthropic.com" \
  -addext "subjectAltName=DNS:api.anthropic.com,DNS:platform.claude.com"

openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out server.crt -days 365 -extfile <(echo "subjectAltName=DNS:api.anthropic.com,DNS:platform.claude.com")

# Trust CA on macOS
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ca.crt
```

### /etc/hosts
```
127.0.0.1 api.anthropic.com
127.0.0.1 platform.claude.com
```

### Node.js TLS Config
```
NODE_EXTRA_CA_CERTS=./ca.crt claude
```

## Логирование

### SQLite Schema
```sql
PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;

CREATE TABLE usage_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL DEFAULT (datetime('now')),
    request_id TEXT,
    session_id TEXT,
    model TEXT,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    thinking_tokens INTEGER DEFAULT 0,
    cache_creation_tokens INTEGER DEFAULT 0,
    cache_read_tokens INTEGER DEFAULT 0,
    cost_usd REAL DEFAULT 0,
    endpoint TEXT,
    status_code INTEGER,
    duration_ms INTEGER,
    is_streaming BOOLEAN DEFAULT 1,
    is_complete BOOLEAN DEFAULT 1,
    cc_version TEXT,
    cc_entrypoint TEXT,
    billing_header TEXT,
    rate_limit_status TEXT,
    error_message TEXT
);

CREATE INDEX idx_timestamp ON usage_log(timestamp);
CREATE INDEX idx_session ON usage_log(session_id);
CREATE INDEX idx_model ON usage_log(model);
```

### Write Strategy
- НЕ использовать `better-sqlite3` синхронно в hot path
- Queue writes через `setImmediate()` или worker thread
- Batch inserts каждые 100ms если высокая нагрузка

### Cost Calculation
Вынести в `pricing.json` (обновляется отдельно):
```json
{
  "claude-opus-4": {"input": 15, "output": 75, "cache_write": 18.75, "cache_read": 1.5},
  "claude-opus-4.6": {"input": 5, "output": 25, "cache_write": 6.25, "cache_read": 0.5},
  "claude-sonnet-4": {"input": 3, "output": 15, "cache_write": 3.75, "cache_read": 0.3},
  "claude-sonnet-4.6": {"input": 3, "output": 15, "cache_write": 3.75, "cache_read": 0.3},
  "claude-haiku-3.5": {"input": 0.8, "output": 4, "cache_write": 1, "cache_read": 0.08},
  "claude-haiku-4.5": {"input": 1, "output": 5, "cache_write": 1.25, "cache_read": 0.1}
}
```
Все цены per 1M tokens. Thinking tokens биллятся как output tokens.

### Dashboard (GET /usage на отдельном порту)
- Total tokens (in/out/thinking/cache)
- Total cost USD
- Per-model breakdown
- Per-day breakdown
- Per-session breakdown
- Rate limit utilization history
- Dashboard слушает на **отдельном порту** (не :443!) — например :9090

## Обработка ошибок
- **429 Too Many Requests** → форвардить as-is, логировать
- **500/502/503** → форвардить as-is, логировать
- **Proxy internal error** → вернуть 502 клиенту, НЕ раскрывать детали
- **TLS handshake failure** → log + alert
- **Upstream timeout** → форвардить timeout клиенту

## Health & Operations
- `GET /health` на dashboard порту → `{"status":"ok","uptime":...,"requests_proxied":...}`
- Graceful shutdown (SIGTERM) → дождаться активных стримов (timeout 30s)
- Log rotation: SQLite records старше 90 дней → archive/delete
- Config file (`config.json`): ports, target hosts, pricing, log retention

## Запуск

```bash
# 1. Установка
npm install

# 2. Генерация сертификатов
./setup-certs.sh

# 3. Настройка /etc/hosts
sudo ./setup-hosts.sh  # добавляет 127.0.0.1 api.anthropic.com platform.claude.com

# 4. Запуск proxy
node proxy.js

# 5. Запуск Claude Code (в другом терминале)
NODE_EXTRA_CA_CERTS=./ca.crt claude

# 6. Dashboard
open http://localhost:9090/usage

# Отключение (восстановить hosts)
sudo ./teardown-hosts.sh
```

## Stack
- **Runtime:** Node.js 22+
- **TLS:** native `tls` module + self-signed CA
- **Proxy:** native `http`/`https` (не http-proxy — нужен полный контроль)
- **SSE Parser:** custom line-based parser
- **DB:** SQLite (better-sqlite3) с WAL mode + async write queue
- **Dashboard:** simple HTML + JSON API на отдельном порту
- **Config:** `config.json` + `pricing.json`

## Security
- Proxy работает ТОЛЬКО на localhost (bind 127.0.0.1)
- Auth tokens НЕ логируются (redacted в debug)
- Request body НЕ логируется (содержит код/секреты)
- SQLite без шифрования (localhost only)
- Setup/teardown скрипты для /etc/hosts
- Dashboard на отдельном порту без auth (localhost only)

## Disclaimer
Этот инструмент предназначен для личного мониторинга собственного API usage. Не предназначен для обхода rate limits, перепродажи доступа, или нарушения Anthropic Terms of Service.
