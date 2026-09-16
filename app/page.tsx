import Link from "next/link";
import { IconChat, IconFile, IconHistory } from "./chrome";
import { ThemeToggle } from "./theme-toggle";
import {
  btnPrimary,
  btnSecondary,
  card,
  code,
  color,
  iconWrap,
  main,
  space,
} from "./theme";

const features = [
  {
    title: "Polling без webhook",
    text: "Бот работает отдельным процессом и сам забирает сообщения из Telegram.",
    icon: IconChat,
  },
  {
    title: "Настройки из файла",
    text: "Промпт и модель лежат в data/agent.json. После сохранения в админке рестарт не нужен.",
    icon: IconFile,
  },
  {
    title: "Короткая история",
    text: "До 20 сообщений на чат в памяти процесса. Команда /reset очищает диалог.",
    icon: IconHistory,
  },
];

const steps = [
  { cmd: "npm run bot", hint: "запуск Telegram-бота" },
  { cmd: "npm run dev", hint: "админка на localhost:3000" },
  { cmd: "npm run dev:all", hint: "оба процесса сразу" },
];

export default function Home() {
  return (
    <main id="main" style={main}>
      <section
        style={{
          display: "grid",
          gap: space.xl,
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
        }}
        className="home-hero"
      >
        <div>
          <div style={{ marginBottom: space.md }}>
            <ThemeToggle />
          </div>
          <p
            style={{
              margin: 0,
              color: color.primary,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontSize: 13,
            }}
          >
            Локальный агент
          </p>
          <h1
            style={{
              margin: "8px 0 16px",
              fontSize: "clamp(28px, 5vw, 40px)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Telegram ИИ-агент и админка настроек
          </h1>
          <p
            style={{
              margin: "0 0 24px",
              color: color.mutedForeground,
              maxWidth: 52 * 16,
              fontSize: 18,
            }}
          >
            Настройте системный промпт и модель в браузере. Бот читает файл при
            каждом сообщении и отвечает через OpenAI.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: space.sm }}>
            <Link href="/admin" style={btnPrimary} data-cta="true">
              Войти в админку
            </Link>
            <a href="#how" style={btnSecondary}>
              Как запустить
            </a>
          </div>
        </div>

        <aside
          aria-label="Макет админки"
          style={{
            ...card,
            padding: space.md,
            background: color.card,
          }}
        >
          <p
            style={{
              margin: "0 0 12px",
              fontSize: 13,
              fontWeight: 600,
              color: color.mutedForeground,
            }}
          >
            Превью настроек
          </p>
          <div
            style={{
              border: `1px solid ${color.border}`,
              borderRadius: 8,
              padding: 12,
              background: color.muted,
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 12,
                fontWeight: 600,
                color: color.foreground,
              }}
            >
              Системный промпт
            </p>
            <div
              style={{
                height: 72,
                borderRadius: 6,
                background: color.card,
                border: `1px solid ${color.border}`,
                marginBottom: 12,
              }}
            />
            <p
              style={{
                margin: "0 0 8px",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Модель
            </p>
            <div
              style={{
                height: 40,
                width: "70%",
                borderRadius: 6,
                background: color.card,
                border: `1px solid ${color.border}`,
                marginBottom: 12,
              }}
            />
            <div
              style={{
                height: 36,
                width: 120,
                borderRadius: 8,
                background: color.primary,
              }}
            />
          </div>
        </aside>
      </section>

      <section aria-labelledby="features-title" style={{ marginTop: space.xxl }}>
        <h2 id="features-title" style={{ margin: "0 0 16px", fontSize: 24 }}>
          Что внутри
        </h2>
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gap: space.md,
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title} style={card}>
                <div style={iconWrap}>
                  <Icon />
                </div>
                <h3 style={{ margin: "16px 0 8px", fontSize: 18 }}>
                  {item.title}
                </h3>
                <p style={{ margin: 0, color: color.mutedForeground }}>
                  {item.text}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        id="how"
        aria-labelledby="how-title"
        style={{ marginTop: space.xxl, ...card }}
      >
        <h2 id="how-title" style={{ margin: "0 0 8px", fontSize: 24 }}>
          Как запустить
        </h2>
        <p style={{ margin: "0 0 16px", color: color.mutedForeground }}>
          Команды из корня проекта. Секреты читаются из{" "}
          <code style={code}>enf.local</code>, настройки агента — из{" "}
          <code style={code}>data/agent.json</code>.
        </p>
        <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
          {steps.map((step) => (
            <li key={step.cmd}>
              <code style={code}>{step.cmd}</code>
              <span style={{ color: color.mutedForeground }}>
                {" "}
                — {step.hint}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
