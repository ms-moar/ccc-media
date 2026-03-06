# CCC Media Repo

Медиа-хранилище группы **Claude Code Club** — изображения, видео, тексты и ресурсы AI Labs Pro.

Используется ботом (`@pm_claude_bot`) и дайджест-системой для хостинга файлов со ссылками через `raw.githubusercontent.com`.

---

## Структура репозитория

```
ccc-media/
│
├── 2026/                          # Медиа из группы (по ISO-неделям)
│   ├── W06/                       #   3 файла  — старт группы
│   ├── W07/                       #   4 файла  — первые обсуждения
│   ├── W08/                       #  98 файлов — пик активности
│   └── W09/                       #  41 файл   — текущая неделя
│
├── texts/                         # Полные тексты длинных сообщений (25 файлов)
│   └── 2026/
│       ├── W07/msg-{id}.md
│       ├── W08/msg-{id}.md
│       └── W09/msg-{id}.md
│
└── ailabspro/                     # Материалы курса AI Labs Pro (~350 файлов, 24 MB)
    ├── files/                     #   Архивы (39 шт) + распакованные (33 папки)
    ├── posts/                     #   Тексты постов курса (4 файла)
    └── screenshots/               #   Скриншоты постов (7 файлов)
```

---

## 2026/ — Медиа группы

Фото, скриншоты, видео и документы из Telegram-чата, организованные по ISO-неделям.

### Именование файлов

| Паттерн                 | Описание                 | Пример                        |
| ----------------------- | ------------------------ | ----------------------------- |
| `msg_{id}.jpg`          | Изображение из сообщения | `msg_2298.jpg`                |
| `msg_{id}.mp4`          | Видео из сообщения       | `msg_3060_9AFD...mp4`         |
| `msg_{id}_sticker.webp` | Стикер                   | `msg_1287_sticker.webp`       |
| `msg_{id}_CC_setup.png` | Скриншот с пояснением    | `msg_364_CC_setup.png`        |
| `msg_{id}_*.md`         | Текстовый документ       | `msg_1332_tmux-cc-hooks...md` |

### Статистика по неделям

| Неделя  | Даты           | JPG | MP4 | Другое | Всего | Тематика                              |
| ------- | -------------- | --- | --- | ------ | ----- | ------------------------------------- |
| **W06** | 3–9 фев        | 1   | 0   | 2 png  | 3     | Настройка Claude Code                 |
| **W07** | 10–16 фев      | 3   | 0   | 1 md   | 4     | Первые обсуждения, пиксель-арт Claude |
| **W08** | 17–23 фев      | 81  | 10  | 7      | 98    | Скриншоты кода, демо, мемы, OpenClaw  |
| **W09** | 24 фев – 2 мар | 34  | 3   | 4      | 41    | AI-инструменты, Perplexity, агенты    |

### Типы контента

- **Скриншоты кода/настроек** — конфигурации Claude Code, tmux, CLAUDE.md, терминал
- **Демо-видео** — записи экрана работы с AI-инструментами
- **Схемы и диаграммы** — архитектура проектов, workflow
- **Мемы и арт** — пиксель-арт маскот Claude, тематические мемы
- **Скриншоты UI** — интерфейсы сервисов (Perplexity, Claude, OpenClaw)

### Как попадают в репо

Автоматически через скрипт `tg_archive_messages.py` → `github_media.py`:

1. Архиватор сохраняет медиа из сообщений группы
2. `github_media.py` загружает файлы в репо через GitHub API
3. Raw URL вставляется в дайджест / полезнятину

---

## texts/ — Полные тексты сообщений

Длинные сообщения из группы (промпты, конфиги, CLAUDE.md, SOUL.md, обсуждения), сохранённые как отдельные markdown-файлы с метаданными.

### Формат файла

```markdown
# Заголовок (первые ~60 символов текста)

**Автор**: @username
**Дата**: DD.MM.YYYY HH:MM
**Топик**: topic_name

---

Полный текст сообщения...
```

### Содержимое (25 файлов)

#### W07 (1 файл)

| Файл          | Автор        | Описание                   |
| ------------- | ------------ | -------------------------- |
| `msg-2424.md` | @tommypoltev | SOUL.md — Who You Are (v1) |

#### W08 (2 файла)

| Файл          | Автор        | Описание                                         |
| ------------- | ------------ | ------------------------------------------------ |
| `msg-3032.md` | @tommypoltev | SOUL.md — Who You Are (v2, with Execution Model) |
| `msg-3033.md` | @tommypoltev | AGENTS.md — Your Workspace                       |

#### W09 (22 файла)

| Файл          | Автор            | Описание                                        |
| ------------- | ---------------- | ----------------------------------------------- |
| `msg-3599.md` | @Papa_Misha      | Организация работы сотрудников с AI             |
| `msg-3613.md` | @odvetnik        | Как сделать бота — безопасное объяснение        |
| `msg-3641.md` | @mikegoryunov    | Использование feature-dev в Claude Code         |
| `msg-3671.md` | @mikegoryunov    | OpenClaw для управления бизнес-процессами       |
| `msg-3679.md` | @mikegoryunov    | Вайб-проекты и стыки с офлайном                 |
| `msg-3686.md` | @tommypoltev     | Настройка аналитики через AI                    |
| `msg-3693.md` | @mikegoryunov    | Техника консилиума в промптах                   |
| `msg-3696.md` | @pavel2077       | Брейншторм промпт                               |
| `msg-3706.md` | @arbitrageus     | Потеря контекста между агентами                 |
| `msg-3737.md` | @Papa_Misha      | Анекдот дня — агент OpenClaw и почта            |
| `msg-3742.md` | @tommypoltev     | Удобная работа агента с почтой                  |
| `msg-3817.md` | @arbitrageus     | Генерация интернет-магазинов с Codex            |
| `msg-3863.md` | @pavel2077       | AutoMaker — десктопная AI-студия                |
| `msg-3867.md` | @mr_mojo_0       | Уроборос — локальная установка                  |
| `msg-3913.md` | @pavel2077       | OpenClaw 2026.2.19-2 — changelog                |
| `msg-4093.md` | @mr_mojo_0       | Вайбкодеры и собака за клавиатурой              |
| `msg-4224.md` | —                | Луис Россман — краткое содержание видео         |
| `msg-4239.md` | @Papa_Misha      | Ответ M-CEO на запрос                           |
| `msg-4246.md` | @Papa_Misha      | M-CEO — агент accountant в действии             |
| `msg-4266.md` | @mr_mojo_0       | Капитализм за 72 часа — 100 агентов Claude      |
| `msg-4290.md` | @indianajones_ok | Домашняя сессия — настройка без сервера         |
| `msg-4291.md` | @Papa_Misha      | Уволенный из Меты — автоматизация поиска работы |

### Как попадают в репо

Автоматически при генерации «полезнятины» (дайджест полезных сообщений):

1. Скрипт `tg_forum_digest.py` находит сообщения длиннее 300 символов
2. `github_media.py` → `save_texts_to_github()` сохраняет .md файлы
3. Ссылка на полный текст добавляется в пост полезнятины

---

## ailabspro/ — Ресурсы курса AI Labs Pro

Материалы платного курса AI Labs Pro от создателя группы: промпты, CLAUDE.md файлы, skills, guides, workflows, шаблоны проектов.

### files/ — Архивы ресурсов (39 файлов)

Ресурсы нумеруются версиями (`v5`–`v45`), каждая версия — новый выпуск курса.

| Версия | Файл                                   | Содержимое                                        |
| ------ | -------------------------------------- | ------------------------------------------------- |
| v5     | `v5-rules.txt`                         | Правила и гайдлайны                               |
| v6     | `v6-tmux-agents.zip`                   | Tmux-агенты: формат, установка, промпт            |
| v7     | `v7-archive.zip`                       | Архив материалов                                  |
| v8     | `v8-claude-agents.zip`                 | Claude агенты: process + prompt                   |
| v11    | `v11-docs.zip`                         | CLAUDE.md + workflow документация                 |
| v12    | `v12-resources.zip`                    | Ресурсы и ссылки                                  |
| v13    | `v13-design-prompt.zip`                | Промпт для дизайна                                |
| v14    | `v14-review-md.zip`                    | Шаблон code review                                |
| v15    | `v15-multi-agent-prompt.zip`           | Multi-Agent промпт                                |
| v16    | `v16-shadcn-agent.zip`                 | Shadcn UI агенты (4 агента)                       |
| v16    | `v16-components-json.md`               | JSON компонентов                                  |
| v17    | `v17-resources.txt`                    | Ресурсы (текст)                                   |
| v19    | `v19-claude-md.zip`                    | Продвинутый CLAUDE.md                             |
| v20    | `v20-archive.zip`                      | Colors, Responsive, Shadow гайды                  |
| v21    | `v21-commands.zip`                     | Кастомные команды (build-page, init-page-builder) |
| v22    | `v22-prompts.zip`                      | Коллекция промптов                                |
| v23    | `v23-figma-agent.zip`                  | Figma → код: Dev MCP, Workflow, Full-Stack Prompt |
| v24    | `v24-cline-workflow.zip/pdf`           | Cline workflow                                    |
| v25    | `v25-claude-agent-harness.zip`         | Agent harness для Claude                          |
| v28    | `v28-claude-chrome-video.zip`          | Chrome + видео интеграция                         |
| v30    | `v30-prompts.txt`                      | Промпты (текст)                                   |
| v31    | `v31-resources.zip`                    | Ресурсы                                           |
| v32    | `v32-antigravity-workflow.zip`         | Antigravity workflow                              |
| v33    | `v33-planning-structure.zip`           | Структура планирования                            |
| v34    | `v34-company-policy.zip`               | Company policy шаблон (Next.js)                   |
| v34    | `v34-research.zip`                     | Research материалы                                |
| v35    | `v35-mock-technical-interview-app.zip` | Mock interview приложение (Next.js)               |
| v36    | `v36-resources.zip`                    | Ресурсы                                           |
| v37    | `v37-installation.md`                  | Инструкция по установке                           |
| v38    | `v38-car-landing-page.zip`             | Car landing page шаблон (Next.js)                 |
| v39    | `v39-resources.zip`                    | Ресурсы                                           |
| v40    | `v40-resources.zip`                    | Ресурсы                                           |
| v41    | `v41-resources.zip`                    | Ресурсы                                           |
| v42    | `v42-skill-creator.zip`                | Skill Creator инструмент                          |
| v42    | `v42-nano-banana-ui-skill.zip`         | Nano Banana UI skill                              |
| v43    | `v43-guides.zip`                       | Гайды                                             |
| v44    | `v44-10-openclaw-uses.zip`             | 10 применений OpenClaw                            |
| v45    | `v45-resources.zip`                    | Последние ресурсы                                 |

### files/extracted/ — Распакованные архивы (33 папки)

Все ZIP-архивы из таблицы выше распакованы в соответствующие поддиректории для полнотекстового поиска.

### posts/ — Тексты постов курса

| Файл                 | Описание                                 |
| -------------------- | ---------------------------------------- |
| `all-posts-index.md` | Индекс всех постов с кратким содержанием |
| `v43-post.txt`       | Текст поста v43                          |
| `v44-post.txt`       | Текст поста v44                          |
| `v45-post.txt`       | Текст поста v45                          |

### screenshots/ — Скриншоты постов

| Файл                 | Описание                                 |
| -------------------- | ---------------------------------------- |
| `logged-in-home.png` | Главная страница AI Labs Pro (залогинен) |
| `v43-post.png`       | Превью поста v43                         |
| `v43-post-full.png`  | Полный скриншот поста v43                |
| `v44-post.png`       | Превью поста v44                         |
| `v44-post-full.png`  | Полный скриншот поста v44                |
| `v45-post.png`       | Превью поста v45                         |
| `v45-post-full.png`  | Полный скриншот поста v45                |

### Индексация в ChromaDB

Все текстовые файлы (.md, .txt) из `ailabspro/` проиндексированы в ChromaDB:

- Скрипт: `index_ailabspro.py`
- Модель эмбеддингов: `paraphrase-multilingual-MiniLM-L12-v2`
- Чанки: до 1500 символов с overlap 200
- Результат: 777 чанков из 170 файлов

Бот `@pm_claude_bot` ищет по этим данным при ответе на вопросы участников группы.

---

## Использование

### Получить raw URL файла

```
https://raw.githubusercontent.com/ms-moar/ccc-media/main/{path}
```

Примеры:

```
https://raw.githubusercontent.com/ms-moar/ccc-media/main/2026/W08/msg_2298.jpg
https://raw.githubusercontent.com/ms-moar/ccc-media/main/texts/2026/W09/msg-4266.md
https://raw.githubusercontent.com/ms-moar/ccc-media/main/ailabspro/files/extracted/v19-claude-md/CLAUDE.md
```

### Скрипты-потребители

| Скрипт                   | Что делает                                       |
| ------------------------ | ------------------------------------------------ |
| `tg_archive_messages.py` | Архивирует сообщения группы, скачивает медиа     |
| `github_media.py`        | Загружает файлы в репо, возвращает raw URL       |
| `tg_forum_digest.py`     | Генерирует дайджесты и полезнятину со ссылками   |
| `index_ailabspro.py`     | Индексирует ailabspro в ChromaDB                 |
| `knowledge_search.py`    | Семантический поиск по базе знаний               |
| `knowledge_bot.py`       | Telegram-бот, отвечает на вопросы через @mention |
