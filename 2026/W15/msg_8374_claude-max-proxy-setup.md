# Claude Max API Proxy — Setup Guide

## Что это
Локальный прокси, который превращает подписку **Claude Max/Pro** ($200/мес) в **OpenAI-совместимый API endpoint**. Можно использовать с любым инструментом, который поддерживает OpenAI API формат.

## Схема работы
```
Твоё приложение → localhost:3456 → Claude Code CLI → Claude (подписка)
  (OpenAI формат)    (конвертирует)    (авторизация)
```

## Требования
- Node.js 20+
- Claude Code CLI (залогиненный)
- Активная подписка Claude Max или Pro

---

## 1. Установить Claude Code CLI

```bash
npm install -g @anthropic-ai/claude-code
claude --version   # должен показать версию
```

Залогиниться:
```bash
claude
# следовать инструкциям авторизации
```

---

## 2. Установить proxy

```bash
npm install -g claude-max-api-proxy
```

---

## 3. Запустить

```bash
claude-max-api
# Слушает на http://localhost:3456
```

Проверить:
```bash
curl http://localhost:3456/health
curl http://localhost:3456/v1/models
```

---

## 4. Тест

```bash
curl http://localhost:3456/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-opus-4",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

---

## 5. Автозапуск (macOS)

```bash
cat > ~/Library/LaunchAgents/com.claude-max-api.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.claude-max-api</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>ProgramArguments</key>
  <array>
    <string>/opt/homebrew/bin/node</string>
    <string>/opt/homebrew/lib/node_modules/claude-max-api-proxy/dist/server/standalone.js</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
    <key>HOME</key>
    <string>/Users/ТВОЙ_ЮЗЕРНЕЙМ</string>
  </dict>
  <key>StandardOutPath</key>
  <string>/tmp/claude-max-api_stdout.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/claude-max-api_stderr.log</string>
  <key>ThrottleInterval</key>
  <integer>5</integer>
</dict>
</plist>
EOF

launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.claude-max-api.plist
```

> ⚠️ Заменить `/opt/homebrew/bin/node` на свой путь (`which node`) и `ТВОЙ_ЮЗЕРНЕЙМ` на свой macOS username.

---

## 6. Подключение к OpenClaw

В `openclaw.json` добавить:

```json
{
  "models": {
    "mode": "merge",
    "providers": {
      "claude-max": {
        "baseUrl": "http://127.0.0.1:3456/v1",
        "apiKey": "not-needed",
        "api": "openai-completions",
        "models": [
          {
            "id": "claude-opus-4",
            "name": "Claude Opus 4 (Max Proxy)",
            "contextWindow": 200000,
            "maxTokens": 8192
          },
          {
            "id": "claude-sonnet-4",
            "name": "Claude Sonnet 4 (Max Proxy)",
            "contextWindow": 200000,
            "maxTokens": 8192
          },
          {
            "id": "claude-haiku-4",
            "name": "Claude Haiku 4 (Max Proxy)",
            "contextWindow": 200000,
            "maxTokens": 8192
          }
        ]
      }
    }
  }
}
```

Модель агента:
```json
"model": {
  "primary": "claude-max/claude-opus-4"
}
```

После правки:
```bash
openclaw gateway restart
```

---

## 7. Известный баг + фикс

Proxy не поддерживает `content` как массив объектов (OpenAI multipart format). Нужен патч.

Файл: `node_modules/claude-max-api-proxy/dist/adapter/openai-to-cli.js`

Найти функцию `messagesToPrompt` и заменить на:

```js
function normalizeContent(content) {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
        return content
            .filter((part) => part && part.type === "text")
            .map((part) => part.text)
            .join("\n");
    }
    if (content && typeof content === "object") {
        return content.text || JSON.stringify(content);
    }
    return String(content ?? "");
}

export function messagesToPrompt(messages) {
    const parts = [];
    for (const msg of messages) {
        const content = normalizeContent(msg.content);
        switch (msg.role) {
            case "system":
                parts.push(`<system>\n${content}\n</system>\n`);
                break;
            case "user":
                parts.push(content);
                break;
            case "assistant":
                parts.push(`<previous_response>\n${content}\n</previous_response>\n`);
                break;
        }
    }
    return parts.join("\n").trim();
}
```

После патча перезапустить proxy:
```bash
launchctl kickstart -k gui/$(id -u)/com.claude-max-api
```

---

## Доступные модели

| Model ID          | Модель          |
|-------------------|-----------------|
| `claude-opus-4`   | Claude Opus 4   |
| `claude-sonnet-4` | Claude Sonnet 4 |
| `claude-haiku-4`  | Claude Haiku 4  |

---

## Важно

- **Community tool**, не официальный от Anthropic
- Anthropic может менять политику по использованию подписки вне Claude Code
- Proxy работает полностью локально, данные никуда не уходят
- Streaming поддерживается

---

## Ссылки

- **npm:** https://www.npmjs.com/package/claude-max-api-proxy
- **GitHub:** https://github.com/atalovesyou/claude-max-api-proxy
- **Дока OpenClaw:** https://docs.openclaw.ai/providers/claude-max-api-proxy
