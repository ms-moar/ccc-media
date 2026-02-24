# TMX: tmux + Claude Code Hooks + saved_state.json — полная схема воспроизведения

> Этот документ описывает всё необходимое для воспроизведения на чистой системе рабочей среды, где десятки Claude Code сессий работают в tmux окнах, а два CC-хука поддерживают актуальное состояние в tmux window variables и файле `saved_state.json`. При перезапуске tmux скрипт `tmx-restore.py` восстанавливает все сессии из этого файла.

---

## Оглавление

1. [Архитектура](#1-архитектура)
2. [Конфигурация tmux](#2-конфигурация-tmux)
3. [Claude Code хуки](#3-claude-code-хуки)
4. [saved_state.json](#4-saved_statejson)
5. [Вспомогательные скрипты](#5-вспомогательные-скрипты)
6. [Восстановление (tmx-restore.py)](#6-восстановление-tmx-restorepy)
7. [Crontab](#7-crontab)
8. [Чеклист развёртывания](#8-чеклист-развёртывания)

---

## 1. Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                   tmux сервер                            │
│                                                          │
│  Конфиг: ~/.tmux.conf + ~/.config/tmux/tmux.conf         │
│  Prefix: Alt+Shift+B    Mouse: on    Mode: vi            │
│  remain-on-exit: on     auto-rename: off                 │
│  base-index: 1          escape-time: 0                   │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ MA:1     │ │ MA:2     │ │ MTA:1    │ │ TMX:1    │   │
│  │ ● MFO UI │ │ ○ API    │ │ ● Deploy │ │ ○ Main   │   │
│  │ Claude   │ │ Claude   │ │ Claude   │ │ Claude   │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘   │
│       │            │            │            │           │
│  Window variables (на каждом окне):                      │
│    @claude_session_id   @claude_sessions                 │
│    @topic_uuid          @working_directory               │
│    @git_branch          @git_worktree                    │
│    @git_main_repo       @project                         │
│    @last_model          @highlighted                     │
│    cc_status (busy/free)                                 │
└───────┬────────────┬────────────┬────────────┬──────────┘
        │            │            │            │
        └────────────┴─────┬──────┴────────────┘
                           │
         CC Hook: UserPromptSubmit / Stop
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │  claude_hook_prompt_submit.sh         │
        │  claude_hook_stop.sh                  │
        │                                       │
        │  1. Читают $TMUX_PANE → контекст      │
        │  2. Извлекают метаданные              │
        │     (model, git, project, cwd)        │
        │  3. Пишут tmux window variables       │
        │  4. Переименовывают окно (●/○)         │
        │  5. Обновляют saved_state.json        │
        │     (prompt: upsert busy)             │
        │     (stop: update free + cleanup)     │
        └──────────────────┬───────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │         saved_state.json              │
        │                                       │
        │  ← Запись: prompt_submit + stop хуки  │
        │  → Чтение: tmx-restore.py             │
        │  ⟲ Коммит: crontab каждые 30 мин      │
        └──────────────────┬───────────────────┘
                           │
              При перезапуске tmux
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │         tmx-restore.py                │
        │                                       │
        │  1. Читает saved_state.json           │
        │  2. Создаёт сессии (tmux new-session) │
        │  3. Создаёт окна (tmux new-window)    │
        │  4. Устанавливает все @ переменные    │
        │  5. claude --resume {session_id}      │
        │     (последовательно, чтобы не OOM)   │
        │  6. oom_score_adj = -1000 на каждый   │
        └──────────────────────────────────────┘
```

---

## 2. Конфигурация tmux

Конфигурация состоит из двух файлов:

- `~/.tmux.conf` — основной (загружается первым)
- `~/.config/tmux/tmux.conf` — дополнительный (загружается вторым, переопределяет/добавляет)

### 2.1. Основной файл: `~/.tmux.conf`

```bash
# ============================================================
# PREFIX
# ============================================================
# Меняем Ctrl+B на Alt+Shift+B — исключает конфликт с VS Code / Cursor
unbind C-b
set-option -g prefix M-B
bind-key M-B send-prefix

# ============================================================
# МЫШЬ
# ============================================================
set -g mouse on

# Scroll up: если приложение ловит мышь — пробрасываем;
# иначе — входим в copy-mode по скроллу
bind -n WheelUpPane if-shell -F -t = "#{mouse_any_flag}" "send-keys -M" "if -Ft= '#{pane_in_mode}' 'send-keys -M' 'copy-mode -e; send-keys -M'"
bind -n WheelDownPane select-pane -t= \; send-keys -M

# Левый клик: только select-pane (НЕ входит в copy-mode)
unbind -n MouseDown1Pane
unbind -n MouseDrag1Pane
bind -n MouseDown1Pane select-pane -t= \; send-keys -M

# Отключаем правый и средний клик на панели
unbind -n MouseDown3Pane
unbind -n MouseDown2Pane

# ============================================================
# COPY-MODE (vi)
# ============================================================
# Отключаем стандартный вход через prefix+[
unbind [
# Вход в copy-mode через prefix+Ctrl+C
bind-key C-c copy-mode

# Отключаем window chooser (prefix+w) — часто нажимается случайно
unbind w

# Скорость скролла
set -g @scroll-speed-num-lines-per-scroll 3
set -g @prevent-scroll-for-fullscreen-alternate-buffer on

# Vi-биндинги
set -g mode-keys vi
bind-key -T copy-mode-vi v send-keys -X begin-selection
bind-key -T copy-mode-vi y send-keys -X copy-selection

# Мышь в copy-mode
unbind -T copy-mode-vi MouseDown1Pane
unbind -T copy-mode-vi MouseDragEnd1Pane

# Клик — сбросить выделение, Drag — выделить, DragEnd — скопировать и выйти
bind -T copy-mode-vi MouseDown1Pane select-pane \; send-keys -X clear-selection
bind -T copy-mode-vi MouseDrag1Pane select-pane \; send-keys -X begin-selection
bind -T copy-mode-vi MouseDragEnd1Pane send-keys -X copy-selection-and-cancel

# Двойной клик — выделить слово, тройной — строку
bind -T copy-mode-vi DoubleClick1Pane select-pane \; send-keys -X select-word
bind -T copy-mode-vi TripleClick1Pane select-pane \; send-keys -X select-line

# Скролл по 10 строк в copy-mode
bind-key -T copy-mode-vi WheelUpPane send-keys -X -N 10 scroll-up
bind-key -T copy-mode-vi WheelDownPane send-keys -X -N 10 scroll-down

# Быстрый выход из copy-mode
bind-key -T copy-mode-vi Escape send-keys -X cancel
bind-key -T copy-mode-vi q send-keys -X cancel

# ============================================================
# НУМЕРАЦИЯ
# ============================================================
set -g base-index 1
setw -g pane-base-index 1

# ============================================================
# МОНИТОРИНГ АКТИВНОСТИ — отключён
# ============================================================
setw -g monitor-activity off
set -g visual-activity off

# ============================================================
# ВНЕШНИЙ ВИД (STATUS BAR)
# ============================================================
set -g status-bg black
set -g status-fg white
set -g status-left-length 30
set -g status-right-length 60
set -g status-left '#[fg=green]#S '
set -g status-right '#[fg=yellow]%Y-%m-%d %H:%M'

# Формат имён окон
setw -g window-status-format '#I:#W'
setw -g window-status-current-format '#[bg=blue] #I:#W #[default]'
setw -g window-status-separator '#[fg=white]|#[default]'

# ============================================================
# НАВИГАЦИЯ ПО ОКНАМ: Alt+number
# ============================================================
bind-key -n M-1 select-window -t 1
bind-key -n M-2 select-window -t 2
bind-key -n M-3 select-window -t 3
bind-key -n M-4 select-window -t 4
bind-key -n M-5 select-window -t 5
bind-key -n M-6 select-window -t 6
bind-key -n M-7 select-window -t 7
bind-key -n M-8 select-window -t 8
bind-key -n M-9 select-window -t 9

# Альтернативные биндинги через prefix
bind-key 1 select-window -t 1
bind-key 2 select-window -t 2
bind-key 3 select-window -t 3
bind-key 4 select-window -t 4
bind-key 5 select-window -t 5
bind-key 6 select-window -t 6
bind-key 7 select-window -t 7
bind-key 8 select-window -t 8
bind-key 9 select-window -t 9

# Дополнительная навигация
bind-key -n M-n next-window
bind-key -n M-p previous-window
bind-key -n M-c new-window
bind-key -n M-r command-prompt -p "rename window to:" "rename-window '%%'"

# Перемещение окон: Alt+< / Alt+>
bind-key -n M-< swap-window -t -1\; select-window -t -1
bind-key -n M-> swap-window -t +1\; select-window -t +1

# ============================================================
# УПРАВЛЕНИЕ ИМЕНАМИ ОКОН
# ============================================================
# Время показа сообщений tmux
set -g display-time 1000

# Запрет автоматического переименования — имена контролируются хуками CC
setw -g automatic-rename off
set -g allow-rename off

# ============================================================
# СТИЛИ
# ============================================================
# Activity/Bell
set -g window-status-activity-style 'fg=red,bg=default'
set -g window-status-bell-style 'fg=yellow,bg=default'

# Границы панелей
set -g pane-border-style 'fg=colour237'
set -g pane-active-border-style 'fg=colour208'

# Сообщения
set -g message-style 'fg=white,bg=blue'
set -g message-command-style 'fg=white,bg=green'

# ============================================================
# ПЛАГИНЫ — ОТКЛЮЧЕНЫ (заменены системой TMX)
# ============================================================
# tmux-resurrect: закомментирован
# tmux-continuum: закомментирован
# Вместо них используется saved_state.json + tmx-restore.py

# ============================================================
# ПРАВЫЙ КЛИК НА STATUS BAR — toggle bold+underline
# ============================================================
unbind -T root MouseDown3Status
bind -T root MouseDown3Status run-shell "<TMX_DIR>/scripts/tmux-toggle-window-highlight.sh '#{session_name}' '#{window_index}'"

# Клавиатурный хоткей Alt+H для той же функции
bind-key -n M-h run-shell "<TMX_DIR>/scripts/tmux-toggle-window-highlight.sh '#{session_name}' '#{window_index}'"

# ============================================================
# ЗАЩИТА ОТ СЛУЧАЙНОГО ЗАВЕРШЕНИЯ
# ============================================================
set-option -g renumber-windows off
set-option -g exit-unattached off
set-option -g destroy-unattached off
set-option -g remain-on-exit on

# ============================================================
# АВТОЗАПУСК CLAUDE В НОВЫХ ОКНАХ
# ============================================================
# При создании нового окна:
#   1. cd в дефолтную директорию сессии
#   2. Запуск claude с LD_PRELOAD и --dangerously-skip-permissions
set-hook -g after-new-window 'run-shell "tmux send-keys -t #{session_name}:#{window_index} \"cd $(<TMX_DIR>/scripts/tmux-session-default-path.sh #{session_name})\" Enter \"clear\" Enter; sleep 0.1; tmux send-keys -t #{session_name}:#{window_index} \"LD_PRELOAD=/home/ubuntu/bin/ignore_kill_eperm.so claude --dangerously-skip-permissions\""'

# ============================================================
# ПЕРЕМЕННАЯ ОКРУЖЕНИЯ
# ============================================================
set-environment -g DISABLE_AUTOUPDATER 1
```

> **Замени `<TMX_DIR>`** на абсолютный путь к проекту TMX (например `/home/ubuntu/TMX`).

### 2.2. Дополнительный файл: `~/.config/tmux/tmux.conf`

Этот файл загружается после основного и добавляет/переопределяет биндинги, в основном для совместимости с Cursor IDE, где `Alt+0` может перехватываться.

```bash
# ============================================================
# ОКНО 0 — множество способов доступа (обход конфликтов IDE)
# ============================================================
bind -n M-0 select-window -t 0
bind -n 'M-0' select-window -t 0
bind -T root 'M-0' select-window -t 0

# ============================================================
# ДУБЛИРОВАНИЕ Alt+1..9 (на случай если ~/.tmux.conf не загрузился)
# ============================================================
bind -n M-1 select-window -t 1
bind -n M-2 select-window -t 2
bind -n M-3 select-window -t 3
bind -n M-4 select-window -t 4
bind -n M-5 select-window -t 5
bind -n M-6 select-window -t 6
bind -n M-7 select-window -t 7
bind -n M-8 select-window -t 8
bind -n M-9 select-window -t 9

# Запасные хоткеи для окна 0
bind -n 'M-`' select-window -t 0      # Alt+` (backtick)
bind -n M-BSpace select-window -t 0   # Alt+Backspace
bind -n F10 select-window -t 0        # F10

# ============================================================
# НАВИГАЦИЯ
# ============================================================
bind -n M-n next-window
bind -n M-p previous-window
bind -n M-Right next-window
bind -n M-Left previous-window

# Управление окнами
bind -n M-c new-window
bind -n M-x confirm-before -p "kill-window #W? (y/n)" kill-window
bind -n M-r command-prompt -p "rename window to:" "rename-window '%%'"

# ============================================================
# ПРОКРУТКА
# ============================================================
set -g mouse on
set -g history-limit 10000

# Убираем задержки (критично для Alt-комбинаций)
set -g assume-paste-time 0
set -g escape-time 0

# Правый клик на панели — вставка из буфера
bind-key -T root MouseDown3Pane if-shell -F -t = "#{mouse_any_flag}" "send-keys -M" "paste-buffer -p"

# Shift+PageUp/PageDown
bind -n S-PageUp copy-mode -u
bind -n S-PageDown send-keys PageDown

# ============================================================
# COPY-MODE
# ============================================================
setw -g mode-keys vi
bind -T copy-mode-vi v send-keys -X begin-selection
bind -T copy-mode-vi y send-keys -X copy-selection-and-cancel

# ============================================================
# ТЕРМИНАЛ
# ============================================================
set -g default-terminal "screen-256color"
```

### 2.3. Сводная таблица всех tmux-настроек

| Категория      | Настройка             | Значение            | Источник                   |
| -------------- | --------------------- | ------------------- | -------------------------- |
| **Prefix**     | `prefix`              | `M-B` (Alt+Shift+B) | `~/.tmux.conf`             |
| **Нумерация**  | `base-index`          | `1`                 | `~/.tmux.conf`             |
|                | `pane-base-index`     | `1`                 | `~/.tmux.conf`             |
|                | `renumber-windows`    | `off`               | `~/.tmux.conf:182`         |
| **Мышь**       | `mouse`               | `on`                | оба файла                  |
|                | `assume-paste-time`   | `0`                 | `~/.config/tmux/tmux.conf` |
|                | `escape-time`         | `0`                 | `~/.config/tmux/tmux.conf` |
| **Copy-mode**  | `mode-keys`           | `vi`                | оба файла                  |
| **Имена окон** | `automatic-rename`    | `off`               | `~/.tmux.conf`             |
|                | `allow-rename`        | `off`               | `~/.tmux.conf`             |
| **Защита**     | `exit-unattached`     | `off`               | `~/.tmux.conf`             |
|                | `destroy-unattached`  | `off`               | `~/.tmux.conf`             |
|                | `remain-on-exit`      | `on`                | `~/.tmux.conf`             |
| **Мониторинг** | `monitor-activity`    | `off`               | `~/.tmux.conf`             |
|                | `visual-activity`     | `off`               | `~/.tmux.conf`             |
| **Буфер**      | `history-limit`       | `10000`             | `~/.config/tmux/tmux.conf` |
| **Терминал**   | `default-terminal`    | `screen-256color`   | `~/.config/tmux/tmux.conf` |
| **Сообщения**  | `display-time`        | `1000`              | `~/.tmux.conf`             |
| **Окружение**  | `DISABLE_AUTOUPDATER` | `1`                 | `~/.tmux.conf`             |

### 2.4. Сводная таблица всех хоткеев

| Хоткей                     | Действие                       | Источник                   |
| -------------------------- | ------------------------------ | -------------------------- |
| `Alt+Shift+B`              | Prefix                         | `~/.tmux.conf`             |
| `Alt+0`                    | Окно 0 (3 варианта биндинга)   | `~/.config/tmux/tmux.conf` |
| `Alt+1` .. `Alt+9`         | Окна 1-9                       | оба файла                  |
| `prefix + 1..9`            | Окна 1-9 (через prefix)        | `~/.tmux.conf`             |
| `Alt+`` `                  | Окно 0 (запасной)              | `~/.config/tmux/tmux.conf` |
| `Alt+Backspace`            | Окно 0 (запасной)              | `~/.config/tmux/tmux.conf` |
| `F10`                      | Окно 0 (запасной)              | `~/.config/tmux/tmux.conf` |
| `Alt+N`                    | Следующее окно                 | оба файла                  |
| `Alt+P`                    | Предыдущее окно                | оба файла                  |
| `Alt+Right`                | Следующее окно                 | `~/.config/tmux/tmux.conf` |
| `Alt+Left`                 | Предыдущее окно                | `~/.config/tmux/tmux.conf` |
| `Alt+C`                    | Новое окно                     | оба файла                  |
| `Alt+R`                    | Переименовать окно             | оба файла                  |
| `Alt+X`                    | Закрыть окно (подтверждение)   | `~/.config/tmux/tmux.conf` |
| `Alt+<`                    | Переместить окно влево         | `~/.tmux.conf`             |
| `Alt+>`                    | Переместить окно вправо        | `~/.tmux.conf`             |
| `Alt+H`                    | Toggle bold+underline на имени | `~/.tmux.conf`             |
| `prefix + Ctrl+C`          | Вход в copy-mode               | `~/.tmux.conf`             |
| `Shift+PageUp`             | Copy-mode + страница вверх     | `~/.config/tmux/tmux.conf` |
| `Shift+PageDown`           | Страница вниз                  | `~/.config/tmux/tmux.conf` |
| `v` (copy-mode)            | Начать выделение               | оба файла                  |
| `y` (copy-mode)            | Скопировать                    | оба файла                  |
| `Escape` / `q` (copy-mode) | Выйти                          | `~/.tmux.conf`             |
| Правый клик на панели      | Вставка из буфера              | `~/.config/tmux/tmux.conf` |
| Правый клик на status bar  | Toggle bold+underline          | `~/.tmux.conf`             |
| Двойной клик (copy-mode)   | Выделить слово                 | `~/.tmux.conf`             |
| Тройной клик (copy-mode)   | Выделить строку                | `~/.tmux.conf`             |

---

## 3. Claude Code хуки

### 3.1. Регистрация хуков в `~/.claude/settings.json`

В секции `"hooks"` глобальных настроек CC регистрируются два хука, связанных с tmux и saved_state:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/home/ubuntu/.claude/hooks/claude_hook_prompt_submit.sh"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "/home/ubuntu/.claude/hooks/claude_hook_stop.sh"
          }
        ]
      }
    ]
  }
}
```

### 3.2. `claude_hook_prompt_submit.sh` — при отправке промпта

**Триггер**: каждый раз, когда пользователь отправляет промпт в Claude Code.

**Вход** (stdin от CC):

```json
{
  "session_id": "6774f6d2-b078-4549-bb7e-52137fd0b229",
  "prompt": "текст промпта пользователя",
  "transcript_path": "/home/ubuntu/.claude/projects/-home-ubuntu-TMX/6774f6d2.jsonl"
}
```

**Алгоритм работы:**

#### Шаг 1: Определение tmux контекста

```bash
# Если нет $TMUX_PANE — это субагент, выходим
if [ -n "$TMUX_PANE" ]; then
    TMUX_INFO=$(tmux display-message -p -t "$TMUX_PANE" '#S|#I|#{window_id}')
    TMUX_SESSION=$(echo "$TMUX_INFO" | cut -d'|' -f1)   # "MA"
    TMUX_WINDOW=$(echo "$TMUX_INFO" | cut -d'|' -f2)     # "1"
    WINDOW_ID=$(echo "$TMUX_INFO" | cut -d'|' -f3)       # "@508"
else
    exit 0  # субагенты не обновляют состояние
fi
```

> **Критично**: субагенты (Task tool) не имеют `$TMUX_PANE` и пропускаются. Только основной процесс CC в tmux-окне обновляет состояние.

#### Шаг 2: Извлечение метаданных

```bash
# Модель из transcript файла
LAST_MODEL=$(grep -o '"model":"[^"]*"' "$TRANSCRIPT_PATH" | tail -1 | sed 's/"model":"//;s/"//')

# Рабочая директория из tmux pane
WORKING_DIR=$(tmux display-message -p -t "$TMUX_SESSION:$TMUX_WINDOW" '#{pane_current_path}')

# Git информация
GIT_BRANCH=$(cd "$WORKING_DIR" && git rev-parse --abbrev-ref HEAD)
GIT_WORKTREE=""  # заполняется если .git — файл (worktree)
GIT_MAIN_REPO=$(cd "$WORKING_DIR" && git rev-parse --show-toplevel)

# Имя окна (очистка от иконок ● ○)
WINDOW_NAME=$(tmux display-message -t "$TMUX_SESSION:$TMUX_WINDOW" -p '#{window_name}')
CLEAN_WINDOW_NAME=$(echo "$WINDOW_NAME" | sed 's/^[●○?] *//' | sed 's/^[_ ]\+//')
```

#### Шаг 3: Управление CC session history в tmux переменных

```bash
EXISTING_SESSION_ID=$(tmux show-option -w -t "$TMUX_SESSION:$TMUX_WINDOW" -qv "@claude_session_id")

if [ "$EXISTING_SESSION_ID" != "$SESSION_ID" ]; then
    # Session ID изменился → старый добавляем в историю
    EXISTING_SESSIONS=$(tmux show-option -w -t "..." -qv "@claude_sessions")
    # Формируем JSON: [{"session_id":"old-id","last_seen":"2026-02-12T..."}]
    # Добавляем старый session_id в массив
    tmux set-option -w -t "..." "@claude_sessions" "$NEW_SESSIONS"
    # Устанавливаем новый
    tmux set-option -w -t "..." "@claude_session_id" "$SESSION_ID"
fi
```

#### Шаг 4: Запись tmux window variables

```bash
tmux set-option -w -t "$TMUX_SESSION:$TMUX_WINDOW" "@claude_session_id"  "$SESSION_ID"
tmux set-option -w -t "$TMUX_SESSION:$TMUX_WINDOW" "@topic_uuid"         "$TOPIC_UUID"
tmux set-option -w -t "$TMUX_SESSION:$TMUX_WINDOW" "@working_directory"  "$WORKING_DIR"
tmux set-option -w -t "$TMUX_SESSION:$TMUX_WINDOW" "@git_branch"         "$GIT_BRANCH"
tmux set-option -w -t "$TMUX_SESSION:$TMUX_WINDOW" "@git_worktree"       "$GIT_WORKTREE"
tmux set-option -w -t "$TMUX_SESSION:$TMUX_WINDOW" "@git_main_repo"      "$GIT_MAIN_REPO"
tmux set-option -w -t "$TMUX_SESSION:$TMUX_WINDOW" "@project"            "$PROJECT_NAME"
tmux set-option -w -t "$TMUX_SESSION:$TMUX_WINDOW" "@last_model"         "$LAST_MODEL"
```

Переменная `@topic_uuid` создаётся через `uuidgen` при первом промпте в окне — это постоянный идентификатор «темы» окна.

#### Шаг 5: Обновление имени окна

```bash
tmux rename-window -t "$TMUX_SESSION:$TMUX_WINDOW" "● $CLEAN_WINDOW_NAME"
# ● = busy (Claude обрабатывает запрос)
```

#### Шаг 6: Обновление saved_state.json

Через `jq` — ищет сессию по `session_name`, окно по `window_index`:

- Если сессия и окно существуют → обновляет поля
- Если окно не существует → добавляет в массив `windows`
- Если сессия не существует → добавляет новый объект сессии

Записываемые поля:

```
@topic_uuid, @claude_session_id, @last_model,
cc_status = "busy",
window_id, window_name, working_directory,
git_branch, git_worktree, git_main_repo, project
```

### 3.3. `claude_hook_stop.sh` — при завершении обработки

**Триггер**: CC закончил обработку (ответил, прервали через Escape, /clear).

**Вход** (stdin от CC):

```json
{
  "session_id": "6774f6d2-b078-4549-bb7e-52137fd0b229",
  "transcript_path": "/home/ubuntu/.claude/projects/-home-ubuntu-TMX/6774f6d2.jsonl"
}
```

**Алгоритм — идентичен prompt_submit, но с отличиями:**

#### Отличие 1: Статус → free

```bash
tmux rename-window -t "$TMUX_SESSION:$TMUX_WINDOW" "○ $CLEAN_WINDOW_NAME"
# ○ = free (Claude ожидает ввода)
```

В `saved_state.json`: `cc_status = "free"`.

#### Отличие 2: Очистка закрытых окон из saved_state.json

После обновления своего окна, stop-хук сканирует **все** окна текущей tmux-сессии и удаляет из `saved_state.json` те записи, чей `@topic_uuid` больше не существует в tmux:

```bash
# Собираем все topic_uuid из текущей tmux-сессии
TMUX_TOPIC_UUIDS=$(tmux list-windows -t "$TMUX_SESSION" -F '#{window_index}' | while read widx; do
    tmux show-option -wqv -t "$TMUX_SESSION:$widx" "@topic_uuid"
done | sort -u)

# Конвертируем в JSON массив
TOPIC_ARRAY=$(echo "$TMUX_TOPIC_UUIDS" | jq -R . | jq -s .)

# Удаляем из saved_state.json окна с topic_uuid, которых нет в tmux
jq --arg session "$TMUX_SESSION" \
   --argjson valid_topics "$TOPIC_ARRAY" \
   'map(
      if .session_name == $session then
        .windows = [.windows[] | select(
          .["@topic_uuid"] == null or (.["@topic_uuid"] | IN($valid_topics[]))
        )]
      else . end
    )' saved_state.json > /tmp/saved_state_cleanup.json && \
mv /tmp/saved_state_cleanup.json saved_state.json
```

### 3.4. Полный список tmux window variables

| Переменная           | Тип           | Пример                                     | Кто пишет               | Зачем                                                       |
| -------------------- | ------------- | ------------------------------------------ | ----------------------- | ----------------------------------------------------------- |
| `@claude_session_id` | string (UUID) | `6774f6d2-b078-...`                        | prompt_submit, stop     | Текущая CC сессия — для `claude --resume`                   |
| `@claude_sessions`   | JSON array    | `[{"session_id":"...","last_seen":"..."}]` | prompt_submit, stop     | История предыдущих CC сессий в этом окне                    |
| `@topic_uuid`        | string (UUID) | `a1b2c3d4-...`                             | prompt_submit           | Постоянный ID «темы» окна (не меняется при смене CC сессии) |
| `@working_directory` | string (path) | `/home/ubuntu/moar-ads`                    | prompt_submit, stop     | Рабочая директория                                          |
| `@git_branch`        | string        | `main`                                     | prompt_submit, stop     | Текущая git ветка                                           |
| `@git_worktree`      | string (path) | пусто или путь                             | prompt_submit, stop     | Путь к worktree (если используется)                         |
| `@git_main_repo`     | string (path) | `/home/ubuntu/moar-ads`                    | prompt_submit, stop     | Корень git репозитория                                      |
| `@project`           | string        | `moar-ads`                                 | prompt_submit, stop     | Имя проекта                                                 |
| `@last_model`        | string        | `claude-opus-4-6`                          | prompt_submit, stop     | Последняя используемая модель                               |
| `cc_status`          | string        | `busy` / `free`                            | prompt_submit, stop     | Статус CC (также отражён иконкой в имени окна)              |
| `@highlighted`       | `0` / `1`     | `1`                                        | toggle-highlight скрипт | Bold+underline на имени окна                                |
| `@command_from_api`  | string        | `mobile_chat`                              | внешний API             | Флаг что команда пришла через API (не из терминала)         |

---

## 4. saved_state.json

### 4.1. Формат

```json
[
  {
    "session_name": "MA",
    "windows": [
      {
        "window_index": 1,
        "window_id": "@508",
        "window_name": "MFO UI",
        "window_name_original": "● MFO UI",
        "@claude_session_id": "6774f6d2-b078-4549-bb7e-52137fd0b229",
        "@claude_sessions": [
          {
            "last_seen": "2026-02-09T14:33:41Z",
            "session_id": "6774f6d2-b078-4549-bb7e-52137fd0b229"
          },
          {
            "last_seen": "2025-12-16T10:37:25Z",
            "session_id": "9601397c-4b48-4abd-8c1e-40971b3b2c69"
          }
        ],
        "@topic_uuid": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "@last_model": "claude-opus-4-6",
        "cc_status": "free",
        "working_directory": "/home/ubuntu/moar-ads",
        "git_branch": "main",
        "git_worktree": null,
        "git_main_repo": "/home/ubuntu/moar-ads",
        "project": "moar-ads"
      }
    ]
  },
  {
    "session_name": "MTA",
    "windows": [ ... ]
  }
]
```

### 4.2. Жизненный цикл

| Событие             | Кто                                     | Что происходит                                       |
| ------------------- | --------------------------------------- | ---------------------------------------------------- |
| Промпт пользователя | `prompt_submit` hook                    | jq: upsert окно, cc_status=`busy`                    |
| CC завершил ответ   | `stop` hook                             | jq: update cc_status=`free` + удаление закрытых окон |
| Перезапуск tmux     | `tmx-restore.py`                        | Чтение → создание сессий/окон, `claude --resume`     |
| Каждые 30 мин       | `crontab` → `autocommit-saved-state.sh` | `git add` + `git commit`                             |

### 4.3. Расположение

```
<TMX_DIR>/saved_state.json
```

---

## 5. Вспомогательные скрипты

### 5.1. `<TMX_DIR>/scripts/tmux-session-default-path.sh`

Маппинг имени tmux-сессии → рабочая директория. Используется при создании новых окон (хук `after-new-window` в tmux.conf) и при восстановлении (`tmx-restore.py`).

```bash
#!/bin/bash
SESSION_NAME="$1"

case "$SESSION_NAME" in
    "TMX")      echo "/home/ubuntu/TMX" ;;
    "MTA")      echo "/home/ubuntu/mt-admin" ;;
    "MA")       echo "/home/ubuntu/moar-ads" ;;
    "GP")       echo "/home/ubuntu/moar-ads/gpv2" ;;
    "arb")      echo "/home/ubuntu/arb" ;;
    "mir")      echo "/home/ubuntu/arb/mir" ;;
    "sp")       echo "/home/ubuntu/arb/sergey" ;;
    "vlad")     echo "/home/ubuntu/arb/vlad" ;;
    "max")      echo "/home/ubuntu/arb/max" ;;
    "ob")       echo "/home/ubuntu/arb/ob" ;;
    "tk")       echo "/home/ubuntu/arb/tk" ;;
    "vp")       echo "/home/ubuntu/arb/vp" ;;
    "ay")       echo "/home/ubuntu/arb/ay" ;;
    "ag")       echo "/home/ubuntu/arb/ag" ;;
    "yp")       echo "/home/ubuntu/arb/yp" ;;
    "preventa") echo "/home/ubuntu/preventa" ;;
    "WebUI")    echo "/home/ubuntu/webui" ;;
    *)          echo "/home/ubuntu/TMX" ;;  # fallback
esac
```

> **Адаптация**: замени маппинг на свои проекты.

### 5.2. `<TMX_DIR>/scripts/tmux-toggle-window-highlight.sh`

Переключает bold+underline на имени окна в status bar.

```bash
#!/bin/bash
SESSION="$1"
WINDOW_INDEX="$2"

CURRENT_STATUS=$(tmux show-window-options -t "${SESSION}:${WINDOW_INDEX}" -v @highlighted 2>/dev/null || echo "0")

if [ "$CURRENT_STATUS" = "1" ]; then
    # Убрать выделение
    tmux set-window-option -t "${SESSION}:${WINDOW_INDEX}" window-status-format '#I:#W'
    tmux set-window-option -t "${SESSION}:${WINDOW_INDEX}" window-status-current-format '#[bg=blue] #I:#W #[default]'
    tmux set-window-option -t "${SESSION}:${WINDOW_INDEX}" @highlighted 0
else
    # Добавить bold+underline
    tmux set-window-option -t "${SESSION}:${WINDOW_INDEX}" window-status-format '#[bold,underscore]#I:#W#[default]'
    tmux set-window-option -t "${SESSION}:${WINDOW_INDEX}" window-status-current-format '#[bg=blue,bold,underscore] #I:#W #[default]'
    tmux set-window-option -t "${SESSION}:${WINDOW_INDEX}" @highlighted 1
fi
```

### 5.3. `<TMX_DIR>/scripts/autocommit-saved-state.sh`

```bash
#!/bin/bash
cd /home/ubuntu/TMX || exit 1

FILE="saved_state.json"

# Если файл не изменён — ничего не делаем
if git diff --quiet "$FILE" && git diff --cached --quiet "$FILE"; then
    exit 0
fi

git add "$FILE"
git commit -m "chore: auto-update saved_state.json"
```

---

## 6. Восстановление (tmx-restore.py)

Скрипт `<TMX_DIR>/restart/tmx-restore.py` — полная реставрация среды после перезапуска tmux.

### 6.1. Алгоритм

```
1. Загрузить saved_state.json
2. Для каждой сессии:
   a. Если сессия уже существует в tmux → пропустить создание
   b. Иначе → tmux new-session -d -s <name> -n <first_window_name> -c <default_path>
   c. Для каждого дополнительного окна:
      → tmux new-window -t <session>:<index> -n <name> -c <working_dir>
   d. Для каждого окна — установить все tmux window variables:
      @claude_session_id, @topic_uuid, @claude_sessions,
      @ai_provider, @last_model, cc_status
3. Для каждого окна с @claude_session_id:
   a. Найти файл сессии CC в ~/.claude/projects/*/
   b. tmux send-keys: cd <dir> && claude --resume <session_id> --dangerously-skip-permissions
   c. Подождать 1.5 сек → проверить что Claude запустился
   d. Защитить процесс от OOM: oom_score_adj = -1000
   e. ПОСЛЕДОВАТЕЛЬНО (не параллельно!) — каждый claude ~500MB RAM
```

### 6.2. Ключевые детали

**LD_PRELOAD**: `LD_PRELOAD=/home/ubuntu/bin/ignore_kill_eperm.so` — кастомная shared library, которая перехватывает `kill()` и подавляет `EPERM`. Нужна чтобы Claude Code не падал при определённых операциях.

**Определение claude vs claudem2**: если `@last_model == "MiniMax-M2"` → запускается `claudem2` вместо `claude`.

**Поиск проекта CC по session_id**: скрипт ищет `<session_id>.jsonl` в `~/.claude/projects/*/` и конвертирует имя директории обратно в путь (дефисы → слеши).

### 6.3. Запуск

```bash
# Параллельное восстановление всех сессий
python3 <TMX_DIR>/restart/tmx-restore.py

# Последовательное с 60 сек задержкой между сессиями
python3 <TMX_DIR>/restart/tmx-restore.py --delay 60

# Восстановить только одну сессию
python3 <TMX_DIR>/restart/tmx-restore.py --only MA

# Исключить сессии
python3 <TMX_DIR>/restart/tmx-restore.py --exclude MA GP

# Продолжить с 5-й сессии (после прерывания)
python3 <TMX_DIR>/restart/tmx-restore.py --delay 60 --start-from 5
```

---

## 7. Crontab

```cron
# Автокоммит saved_state.json каждые 30 минут
30 * * * * /home/ubuntu/TMX/scripts/autocommit-saved-state.sh >> /home/ubuntu/logs/autocommit-tmx.log 2>&1
```

---

## 8. Чеклист развёртывания

### Пререквизиты

- [ ] tmux установлен (`apt install tmux`)
- [ ] jq установлен (`apt install jq`)
- [ ] uuidgen установлен (`apt install uuid-runtime`)
- [ ] Claude Code установлен и работает
- [ ] Python 3.12+ с asyncio
- [ ] git инициализирован в директории TMX

### Файлы для создания

| Файл                                                | Назначение                                 |
| --------------------------------------------------- | ------------------------------------------ |
| `~/.tmux.conf`                                      | Основной конфиг tmux (секция 2.1)          |
| `~/.config/tmux/tmux.conf`                          | Дополнительный конфиг (секция 2.2)         |
| `~/.claude/settings.json`                           | Регистрация CC хуков (секция 3.1)          |
| `~/.claude/hooks/claude_hook_prompt_submit.sh`      | CC хук prompt_submit (секция 3.2)          |
| `~/.claude/hooks/claude_hook_stop.sh`               | CC хук stop (секция 3.3)                   |
| `<TMX_DIR>/saved_state.json`                        | Файл состояния (инициализировать как `[]`) |
| `<TMX_DIR>/scripts/tmux-session-default-path.sh`    | Маппинг сессий (секция 5.1)                |
| `<TMX_DIR>/scripts/tmux-toggle-window-highlight.sh` | Toggle highlight (секция 5.2)              |
| `<TMX_DIR>/scripts/autocommit-saved-state.sh`       | Автокоммит (секция 5.3)                    |
| `<TMX_DIR>/restart/tmx-restore.py`                  | Восстановление (секция 6)                  |

### Шаги

1. Создать все файлы из таблицы выше
2. `chmod +x` на все `.sh` скрипты
3. Заменить `<TMX_DIR>` на реальный путь во всех файлах
4. Отредактировать маппинг в `tmux-session-default-path.sh` под свои проекты
5. Инициализировать `saved_state.json` как `[]`
6. `tmux source-file ~/.tmux.conf` — загрузить конфиг
7. Добавить crontab: `crontab -e` → строка из секции 7
8. Создать директорию для логов: `mkdir -p /home/ubuntu/logs`
9. Проверить: открыть окно tmux, запустить claude, отправить промпт → убедиться что имя окна изменилось на `● Name` и `saved_state.json` обновился
