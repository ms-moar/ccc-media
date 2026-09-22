# Индекс кода и живое описание архитектуры, сентябрь 2026

Снято 2026-09-19 UTC. Кат: какие живые инструменты закрывают (1) граф/символьный индекс для агента и (2) генерацию и поддержание описания границ — и умеют ли инкремент по диффу и прогон.

## Живые

**Graphify** — `Graphify-Labs/graphify`, 119 590★, Apache-2.0, Python, `v0.9.64` 2026-09-18. PyPI `graphifyy` (две y), CLI `graphify`. Сайт `graphify.com`, MCP `https://api.graphify.com/mcp`. Вход: исходники (+ docs/PDF/SQL/Terraform). Выход: `graphify-out/graph.json`, `GRAPH_REPORT.md`, `graph.html`, опционально `wiki/` и `callflow-html`. Форма: CLI + skill `/graphify` + MCP. Установка: `uv tool install graphifyy` затем `graphify install`. Код — tree-sitter без LLM; docs — модель. EXTRACTED-рёбра — AST; отчёт/wiki/INFERRED — **пересказчик**. «Differential formal verification» есть только у Enterprise в `llms-full.txt`; в OSS README и issues прогона нет. Инкремент: SHA256-кэш, `--update`, `graphify hook install`. Открыто: [#2406](https://github.com/Graphify-Labs/graphify/issues/2406) (теряются cross-file рёбра), [#1152](https://github.com/Graphify-Labs/graphify/issues/1152) (ghost nodes), [#2033](https://github.com/Graphify-Labs/graphify/issues/2033) (`update` без `kind=ast` гоняет семантику по всему корпусу). Code-only: 0 LLM. На 52 файлах — 71.5× меньше токенов на запрос. На 500–1000 файлов авторы сумму не называют.

Имена. `graphify.net` / `app.graphify.net` / `api.graphify.net` не связаны с Graphify Labs. Прочие `graphify*` на PyPI — не этот проект. `graph-ify` отдельного живого продукта нет.

**Understand-Anything** — `Egonex-AI/Understand-Anything`, 83 307★, MIT, TypeScript. Релиз `v2.9.0` 2026-07-10; push 2026-09-12. На этой машине кэш `2.8.1`. Установка: `/plugin marketplace add Egonex-AI/Understand-Anything` затем `/plugin install understand-anything`. Выход: `.ua/knowledge-graph.json` (legacy `.understand-anything/`) + дашборд. Агенты: `project-scanner`, `file-analyzer`, `architecture-analyzer`, `graph-reviewer`, `domain-analyzer`. Скиллы: `understand`, `understand-diff`, `understand-domain`. Tree-sitter — структура; LLM — summary, слои, туры, домены (**пересказчик**). `graph-reviewer` проверяет JSON, не код. `tested_by` — LLM + пути, не pytest. `/understand-diff` пишет `diff-overlay.json` и **граф не патчит**. Инкремент: `git diff <last>..HEAD` по файлам; слои всегда с полного merged-набора. `--auto-update` — post-commit hook. README: «significant» токенов на первом прогоне. Skill: без `scan-result.json` инкремент ~157k токенов / ~158 с. Better Stack (вторичный): ~200k / ~30 мин на Online Boutique.

**CodeGraph** — `colbymchenry/codegraph`, 71 481★, MIT, Rust/C, `v1.6.0` 2026-08-26 (push 2026-09-16). `curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh`, затем `codegraph install` и `codegraph init`. Выход: SQLite `.codegraph/`; MCP `codegraph_explore`. Инкремент: FSEvents/inotify; ~0.3 с на 4 400 файлах, ~4 с на одном файле Swift-compiler. `affected` указывает тесты, **не гоняет**. Индекс без LLM. Вопрос про архитектуру VS Code (~11k файлов): $0.53 / 155k токенов с графом vs $1.80 / 670k без (Opus 4.8, 2026-08-05).

**codebase-memory-mcp** — `DeusData/codebase-memory-mcp`, 43 814★, MIT, C, `v0.11.0` 2026-09-15. `curl -fsSL https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/install.sh | bash`. Выход: SQLite в `~/.cache/codebase-memory-mcp/` + опциональный `.codebase-memory/graph.db.zst`. MCP: search/trace/`get_architecture`/`detect_changes`/`manage_adr`. Инкремент: XXH3 + watcher (arxiv:2603.27277). `ingest_traces` валидирует `HTTP_CALLS` runtime-трассами — прогон, только HTTP. 5 запросов: ~3 400 vs ~412 000 токенов. Kernel 75k файлов — 3 мин индекса.

**Serena** — `oraios/serena`, 29 612★, Python, MCP. `v1.7.0` 2026-08-09 — последний MIT; дальше GPL-3.0-or-later. `uvx --from git+https://github.com/oraios/serena serena start-mcp-server`. Символьный LSP-индекс, wiki не пишет. Кэш language server, не дифф коммита.

**LikeC4** — `likec4/likec4`, 5 696★, MIT, TypeScript, `v1.59.3` 2026-09-02. `npm i -D likec4`; `npx likec4 start`; MCP `npx -y @likec4/mcp`. Вход: `.c4`, не исходники. Watch — модели. Vitest по модели, не runtime. Architecture-as-code, не extract-from-source.

**ArchUnit** — `TNG/ArchUnit`, 3 838★, Apache-2.0, Java, `v1.5.0` 2026-08-04. JUnit-правила по байткоду. Описания не генерирует. Стек этого репо не Java.

**dependency-cruiser** — `sverweij/dependency-cruiser`, 7 200★, MIT, JS, `v18.3.1` 2026-09-14. `npx depcruise`. Правила импортов в CI. JS/TS, не wiki.

**DeepWiki** — SaaS Cognition, `https://deepwiki.com`. Репозиторий `CognitionAI/deepwiki`: 94★, push 2025-05-22 — оболочка. Клон `AsyncFuncAI/deepwiki-open`: 18 011★, MIT, push 2026-09-03. Wiki + диаграммы + Q&A. Инкремента по диффу коммита в лендинге нет. **Пересказчик**.

## Мёртвые или заброшенные

- `BloopAI/bloop` — archived 2024-12-04, 9 493★.
- `structurizr/cli` — archived 2026-02-01.
- `npryce/adr-tools` — push 2024-04-25, не archived, не живой CLI.
- `cased/kit` — push 2026-03-03: отстающий, не мёртвый.
- `CognitionAI/deepwiki` как git — заброшен; продукт живёт SaaS.

## Инкрементальность — кто умеет

Патч индекса по изменённым файлам: **CodeGraph** (watcher, измерено), **codebase-memory-mcp** (hash + watcher), **Graphify** (кэш/`--update`/hook, баги #2406/#1152/#2033), **Understand-Anything** (git diff файлов; слои — полный пересчёт; `/understand-diff` граф не обновляет). **LikeC4** — только `.c4`. **Serena** — LSP, не commit-diff. **DeepWiki / ArchUnit / dependency-cruiser** — «один коммит → патч описания» нет.

Никто из графовых LLM-инструментов не держит карточку границы как проверяемый контракт: отчёт/слои/wiki пересобираются из текущего графа.

## Кто проверяет прогоном, а не чтением

- **ArchUnit** — JUnit по байткоду.
- **dependency-cruiser** — CI по импортам (статика).
- **codebase-memory-mcp `ingest_traces`** — трассы против `HTTP_CALLS`.
- **LikeC4** — тесты модели, не кода.

Остальные читают AST/LLM. Graphify EXTRACTED — парсер; GRAPH_REPORT/wiki/INFERRED — пересказ. UA summary/layers/tours/domain — пересказ. CodeGraph/Serena отдают символы, не «модуль X жив». Enterprise-verification Graphify в OSS не подтверждена.

## Что из этого ставится к нам сегодня

Уже стоит Understand-Anything `2.8.1` и `/architecture` (`mod-*` + `audit-map.py`). Внешние инструменты дают индекс и пересказ, не прогон границы.

Для (1): **CodeGraph** или **codebase-memory-mcp** — инкремент без LLM, MCP. Graphify — если нужен `GRAPH_REPORT.md`/`wiki`; только `graphify.com` / `graphifyy`, не `graphify.net`; после pull всё равно `graphify update .`. UA — черновик слоёв; `/understand-diff` — impact, не актуализация. LikeC4 — только если модель пишем сами. ArchUnit — нет.

Решение не требуется: инвентарь, не выбор.

## Источники

- https://github.com/Graphify-Labs/graphify
- https://github.com/Graphify-Labs/graphify/releases/tag/v0.9.64
- https://raw.githubusercontent.com/Graphify-Labs/graphify/v8/README.md
- https://raw.githubusercontent.com/Graphify-Labs/graphify/v8/docs/how-it-works.md
- https://graphify.com/llms-full.txt
- https://graphify.com/graphify-net-vs-graphify-com
- https://github.com/Graphify-Labs/graphify/issues/2406
- https://github.com/Graphify-Labs/graphify/issues/1152
- https://github.com/Graphify-Labs/graphify/issues/2033
- https://app.graphify.net/
- https://github.com/Egonex-AI/Understand-Anything
- https://raw.githubusercontent.com/Egonex-AI/Understand-Anything/main/README.md
- https://github.com/Egonex-AI/Understand-Anything/releases
- https://betterstack.com/community/guides/ai/understand-anything/
- https://github.com/colbymchenry/codegraph
- https://raw.githubusercontent.com/colbymchenry/codegraph/main/README.md
- https://github.com/DeusData/codebase-memory-mcp
- https://raw.githubusercontent.com/DeusData/codebase-memory-mcp/main/README.md
- https://arxiv.org/abs/2603.27277
- https://github.com/oraios/serena
- https://raw.githubusercontent.com/oraios/serena/main/LICENSE
- https://github.com/likec4/likec4
- https://likec4.dev/tooling/mcp/
- https://likec4.dev/guides/validate-your-model/
- https://github.com/TNG/ArchUnit
- https://github.com/sverweij/dependency-cruiser
- https://github.com/sverweij/dependency-cruiser/releases/tag/v18.3.1
- https://deepwiki.com
- https://github.com/CognitionAI/deepwiki
- https://github.com/AsyncFuncAI/deepwiki-open
- https://github.com/BloopAI/bloop
- https://github.com/structurizr/cli
- https://github.com/npryce/adr-tools
- https://github.com/cased/kit
