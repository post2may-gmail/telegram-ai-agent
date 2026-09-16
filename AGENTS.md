# Проект 1 — правила для агента

Локальный Telegram ИИ-агент (polling) и веб-админка настроек. UI и сообщения бота — на русском.

## Стек (не менять без явной просьбы)

- **Next.js 15** App Router, **React 19**, **TypeScript** (`strict: true`)
- **grammY** — Telegram-бот, long polling (`bot.start()`), не webhook
- **openai** SDK — `chat.completions.create`
- Запуск бота: `tsx bot/index.ts`
- Параллельный запуск: `concurrently` (`npm run dev:all`)
- Стили: **инлайн `style` / `CSSProperties`**, без Tailwind, CSS-модулей и UI-китов
- Алиас: `@/*` → корень проекта. В `bot/` импортировать `lib` относительно (`../lib/...`)
- API-роуты с файловой системой: `export const runtime = "nodejs"`

Не добавлять БД, ORM, Tailwind, webhook-сервер и новые зависимости, если задача этого не требует.

## Структура

```
app/                 # Next.js: страницы и API
  page.tsx           # главная
  admin/page.tsx     # клиентская админка (промпт + модель)
  api/agent/route.ts # GET/PUT настроек
bot/index.ts         # процесс Telegram-бота
lib/env.ts           # секреты из enf.local
lib/agent-store.ts   # чтение/запись data/agent.json
lib/openai.ts        # вызов модели
data/agent.json      # системный промпт и модель
enf.local            # секреты, НЕ коммитить
```

Скрипты: `npm run dev` — админка (`localhost:3000`), `npm run bot` — бот, `npm run dev:all` — оба.

## Секреты — обязательно

Файл **`enf.local`** в корне (не `.env`). Формат фиксированный, парсер в `lib/env.ts`:

```
API_GPT <ключ>
TOKEN_TELEGRAM <токен>
ADMIN_LOGIN <логин>
ADMIN_PASSWORD <пароль>
```

- Не читать, не печатать, не цитировать содержимое `enf.local` в чате, логах, ошибках API и коммитах.
- Не класть ключи в код, `data/agent.json`, клиентский бандл, URL и ответы `/api/*`.
- Клиенту отдавать только безопасные тексты ошибок («Не удалось сохранить настройки»), детали — в лог сервера.
- Админка (`/admin`) и `/api/agent` закрыты сессией после логина; логин/пароль только из `enf.local`.
- На Vercel те же ключи задаются как Environment Variables: `API_GPT`, `TOKEN_TELEGRAM`, `ADMIN_LOGIN`, `ADMIN_PASSWORD`.
- Файл уже в `.gitignore`. Не предлагать перейти на `.env`, пока явно не попросят.

## Данные и поведение

- Настройки агента: только `data/agent.json` (`prompt`, `model`). Бот читает файл **на каждое** сообщение — после сохранения в админке рестарт не нужен.
- История диалога: `Map` в памяти процесса бота, **не больше 20** сообщений на чат (`MAX_HISTORY`). `/reset` очищает историю чата.
- Модели по умолчанию: `AVAILABLE_MODELS` в `lib/agent-store.ts`. Дефолт: `gpt-4o-mini`.
- Валидация PUT `/api/agent`: `prompt` и `model` — непустые строки; ответ 400 при неверном теле, 500 при сбое записи.
- Пользовательские тексты в Telegram не логировать целиком (ПДн).

## Логирование — обязательно

Отдельного логгера нет: использовать `console` с префиксом модуля. Не оставлять «голый» `console.log` без контекста.

Префиксы:

| Место | Префикс |
|---|---|
| `bot/index.ts` | `[bot]` |
| `app/api/agent/route.ts` | `[api]` |
| `app/api/auth/route.ts` | `[api]` |
| `lib/openai.ts` | `[openai]` |
| `lib/agent-store.ts` | `[store]` |
| `lib/env.ts` | `[env]` |
| `lib/auth.ts` | `[auth]` |

Правила:

- **info** — жизненный цикл: старт бота, `@username`, успешное сохранение настроек.
- **error** — любой `catch` и `bot.catch`: сообщение + объект ошибки. Не глотать исключения.
- **warn** — деградация без падения (битый `agent.json` → дефолты).
- Не логировать: `API_GPT`, `TOKEN_TELEGRAM`, `ADMIN_LOGIN`, `ADMIN_PASSWORD`, содержимое `enf.local`, сырое тело запросов с секретами, полные тексты пользователя и историю чата.
- В клиентских компонентах (`"use client"`) не писать `console.*` в прод-пути; ошибки показывать в UI (`error` / `message` state), как на `/admin`.
- Старт бота при отсутствии секретов: `console.error` и `process.exit(1)` — не оставлять процесс «молча живым».

Примеры:

```ts
console.info("[bot] Telegram bot started (polling)");
console.info(`[bot] @${info.username} is running`);
console.error("[bot] Agent error:", err);
console.error("[api] PUT /api/agent failed:", err);
```

При правках существующих логов привести их к этим префиксам.

## Код и UI

- TypeScript, без `any`. Типы ответов API и тела запросов — явные.
- Серверные обработчики: проверять типы полей до записи на диск.
- React: функциональные компоненты. Админка остаётся клиентской из‑за формы и `fetch`.
- Тексты UI, ответы бота, JSON-ошибки API — на русском.
- Сохранять визуальный стиль: шрифт `Segoe UI, system-ui, sans-serif`, фон `#f6f6f4`, тёмная кнопка `#111`, без новых дизайн-систем.
- Не раздувать дифф: не рефакторить соседние файлы и не «улучшать» архитектуру без запроса.
- После изменений UI проверить затронутый сценарий (главная, `/admin`, сохранение настроек), а не только внешний вид.

## Что не ломать

- Polling grammY и отдельный процесс бота (`npm run bot`).
- Формат `enf.local` и кэш `getSecrets()`.
- Контракт `/api/agent`: GET `{ settings, models }`, PUT тело `{ prompt, model }`, ответ `{ settings, models }`.
- То, что `askAgent` каждый раз вызывает `readAgentSettings()`.
- Команды бота: `/start`, `/reset`, ответы на `message:text`.
)
