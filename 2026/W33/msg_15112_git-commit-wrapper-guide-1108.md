# Безопасный commit workflow через wrapper

Механизм состоит из wrapper-скрипта и двух `PreToolUse` hooks Claude Code. Он стандартизирует staging/commit, запрещает опасные Git-команды в агентном harness и валидирует сообщения коммитов.

> Это **harness policy**, а не системная граница безопасности Git. Пользователь, процесс вне Claude Code или изменённая конфигурация hooks могут вызвать `git` напрямую. Для жёсткой серверной защиты дополнительно применяйте protected branches, запрет force-push и обязательные CI checks.

## 1. Зависимости

Нужны `bash`, `git`, `jq`, `sed`, `grep` (`grep` должен поддерживать `-P`, как GNU grep):

```bash
command -v bash git jq sed grep
```

Ниже замените `USER` и все пути `/home/USER/...` на абсолютный home целевого пользователя.

## 2. Установка файлов

Скопируйте три проверенных файла на целевую машину:

```bash
mkdir -p /home/USER/.claude/scripts /home/USER/.claude/hooks

cp /path/to/skill-git-commit.sh \
  /home/USER/.claude/scripts/skill-git-commit.sh
cp /path/to/block-raw-git.sh \
  /home/USER/.claude/hooks/block-raw-git.sh
cp /path/to/validate-commit-format.sh \
  /home/USER/.claude/hooks/validate-commit-format.sh

chmod 0755 \
  /home/USER/.claude/scripts/skill-git-commit.sh \
  /home/USER/.claude/hooks/block-raw-git.sh \
  /home/USER/.claude/hooks/validate-commit-format.sh
```

Назначение:

- `skill-git-commit.sh <message-file> [path...]` — единственная штатная точка commit;
- `block-raw-git.sh` — разрешает wrapper, запрещает raw `git commit` и forward-only нарушающие операции: `reset`, `rebase`, force-push, destructive checkout/clean/ref deletion и другие переписывающие историю команды;
- `validate-commit-format.sh` — проверяет сообщение до запуска wrapper.

## 3. Подключение PreToolUse hooks

Добавьте оба Bash-hook объекта в массив `hooks.PreToolUse` файла `/home/USER/.claude/settings.json`, сохранив существующие элементы:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/home/USER/.claude/hooks/block-raw-git.sh"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "/home/USER/.claude/hooks/validate-commit-format.sh"
          }
        ]
      }
    ]
  }
}
```

Если `settings.json` уже содержит другие ключи/hooks, не заменяйте файл целиком — слейте только два объекта. После правки проверьте JSON:

```bash
jq empty /home/USER/.claude/settings.json
```

## 4. Поведение wrapper

```text
skill-git-commit.sh <message-file> [--force] [path...]
```

Алгоритм:

1. Без `path...` выполняет `git add -A`.
2. С путями выполняет `git add -- path...`, изолируя commit от чужого/WIP-кода.
3. `--force` допустим только первым аргументом после message-file и переключает scoped staging на `git add -f -- path...`; используйте лишь для намеренно добавляемых ignored-файлов.
4. Если в выбранном scope нет staged changes, печатает `Nothing to commit`, возвращает `0`, commit не создаёт. Message-file при этом остаётся.
5. Если существует `<repo>/.claude/hooks/pre-commit-autobump.sh`, запускает его через `bash` перед commit. Это необязательный repo-local hook; проект сам отвечает за его содержимое и проверки.
6. Удаляет строки `Co-Authored-By:` и оставшиеся хвостовые пустые строки из message-file.
7. Выполняет `git commit -F <message-file>`; при scoped-вызове также передаёт `-- path...`.
8. После успешного commit удаляет message-file и печатает hash/subject созданного коммита.

Wrapper работает с текущим репозиторием и его общим Git index. Поэтому при параллельной работе всегда передавайте точные пути.

## 5. Формат сообщения

Первая строка обязательна:

```text
type(scope): description
```

Допустимые `type`:

```text
feat | fix | refactor | chore | docs | style | test | perf | ci
```

Тело должно содержать минимум один заголовок `## `. Проекты могут дополнять validator своими gates, например требовать `AC:`, `spec-lock:`, `smoke:` или `verified:` для отдельных scopes/типов изменений.

Пример `/tmp/commit-msg.txt`:

```markdown
docs(git): describe safe commit wrapper

## Почему

Исключить случайный захват unrelated WIP и прямое переписывание истории агентом.

## Проверка

- scoped staging включает только указанные файлы
- validator принимает Conventional Commit subject и Markdown-секцию
```

Scoped commit:

```bash
/home/USER/.claude/scripts/skill-git-commit.sh \
  /tmp/commit-msg.txt \
  docs/git-guide.md scripts/git-helper.sh
```

Для intentionally ignored path:

```bash
/home/USER/.claude/scripts/skill-git-commit.sh \
  /tmp/commit-msg.txt \
  --force path/to/ignored-but-required-file
```

## 6. Smoke checklist

Проводите smoke в отдельном временном репозитории, не на рабочей ветке:

- [ ] `bash -n` проходит для всех трёх скриптов.
- [ ] `jq empty /home/USER/.claude/settings.json` проходит.
- [ ] Raw `git commit` через Bash tool отклоняется `block-raw-git.sh`.
- [ ] Вызов `skill-git-commit.sh` разрешается первым hook.
- [ ] Неверный subject и сообщение без `## ` отклоняются validator.
- [ ] Валидный message-file создаёт commit через `git commit -F`.
- [ ] При двух изменённых файлах scoped paths коммитят только выбранный файл; второй остаётся изменённым/не застейдженным.
- [ ] Вызов без paths включает все изменения через `git add -A`.
- [ ] Повторный вызов без новых изменений возвращает `0` и сообщает `Nothing to commit`.
- [ ] `Co-Authored-By:` отсутствует в `git log -1 --format=%B`.
- [ ] Message-file удалён после успешного commit.
- [ ] Тестовые `reset`, `rebase`, force-push и destructive-команды проверяются только под harness либо подачей синтетического JSON в hook — не запускайте их против реального репозитория.
- [ ] Repo-local `.claude/hooks/pre-commit-autobump.sh`, если используется, действительно запускается и не добавляет изменения вне ожидаемого scope.

Минимальная синтаксическая проверка:

```bash
bash -n /home/USER/.claude/scripts/skill-git-commit.sh
bash -n /home/USER/.claude/hooks/block-raw-git.sh
bash -n /home/USER/.claude/hooks/validate-commit-format.sh
```

Forward-only правило: исправления и откаты оформляйте новыми коммитами, обычно `git revert <commit>`, без изменения уже существующей истории.
