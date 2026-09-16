"use client";

import {
  FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  btnPrimary,
  btnSecondary,
  card,
  code,
  color,
  main,
  space,
} from "../theme";

type AgentSettings = {
  prompt: string;
  model: string;
};

type AuthState = "checking" | "guest" | "authed";

export default function AdminPage() {
  const [auth, setAuth] = useState<AuthState>("checking");
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [models, setModels] = useState<string[]>(["gpt-4o-mini"]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [promptError, setPromptError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const promptId = useId();
  const modelId = useId();
  const loginId = useId();
  const passwordId = useId();
  const promptHintId = useId();
  const promptErrorId = useId();
  const modelHintId = useId();
  const formErrorId = useId();

  async function loadSettings() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent");
      if (res.status === 401) {
        setAuth("guest");
        return;
      }
      if (!res.ok) throw new Error("Не удалось загрузить настройки");
      const data = (await res.json()) as {
        settings: AgentSettings;
        models: string[];
      };
      setPrompt(data.settings.prompt);
      setModel(data.settings.model);
      setModels(data.models.length ? data.models : [data.settings.model]);
      setAuth("authed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth");
        if (cancelled) return;
        if (!res.ok) {
          setAuth("guest");
          return;
        }
        setAuth("authed");
        await loadSettings();
      } catch {
        if (!cancelled) setAuth("guest");
      }
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setLoginError(data.error || "Неверный логин или пароль");
        return;
      }
      setPassword("");
      setAuth("authed");
      await loadSettings();
    } catch {
      setLoginError("Не удалось выполнить вход");
    } finally {
      setLoggingIn(false);
    }
  }

  async function onLogout() {
    setMessage(null);
    setError(null);
    try {
      await fetch("/api/auth", { method: "DELETE" });
    } finally {
      setAuth("guest");
      setPrompt("");
      setPassword("");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    setPromptError(null);

    if (!prompt.trim()) {
      setPromptError("Промпт не может быть пустым");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/agent", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model }),
      });
      if (res.status === 401) {
        setAuth("guest");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось сохранить настройки");

      setPrompt(data.settings.prompt);
      setModel(data.settings.model);
      setMessage("Сохранено. Бот подхватит настройки на следующем сообщении.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить настройки");
    } finally {
      setSaving(false);
    }
  }

  const promptDescribedBy = [
    promptHintId,
    promptError ? promptErrorId : null,
  ]
    .filter(Boolean)
    .join(" ");

  if (auth === "checking") {
    return (
      <main id="main" style={main} aria-busy="true">
        <h1 style={titleStyle}>Админка агента</h1>
        <p style={{ color: color.mutedForeground, marginTop: 0 }}>Проверка входа…</p>
      </main>
    );
  }

  if (auth === "guest") {
    return (
      <main id="main" style={main}>
        <h1 style={titleStyle}>Вход в админку</h1>
        <p style={{ margin: "0 0 24px", color: color.mutedForeground, maxWidth: 520 }}>
          Логин и пароль задаются в <code style={code}>enf.local</code> (
          <code style={code}>ADMIN_LOGIN</code>, <code style={code}>ADMIN_PASSWORD</code>).
        </p>

        <form onSubmit={onLogin} style={{ ...card, maxWidth: 420 }} noValidate>
          <div style={{ display: "flex", flexDirection: "column", gap: space.lg }}>
            <div>
              <label htmlFor={loginId} style={labelStyle}>
                Логин
              </label>
              <input
                id={loginId}
                type="text"
                autoComplete="username"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                required
                style={fieldStyle}
              />
            </div>
            <div>
              <label htmlFor={passwordId} style={labelStyle}>
                Пароль
              </label>
              <input
                id={passwordId}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={fieldStyle}
              />
            </div>
            {loginError && (
              <p role="alert" style={fieldError}>
                {loginError}
              </p>
            )}
            <button
              type="submit"
              disabled={loggingIn}
              aria-busy={loggingIn}
              style={{ ...btnPrimary, alignSelf: "flex-start" }}
              data-cta="true"
            >
              {loggingIn ? "Вход…" : "Войти"}
            </button>
          </div>
        </form>
      </main>
    );
  }

  if (loading) {
    return (
      <main id="main" style={main} aria-busy="true">
        <h1 style={titleStyle}>Админка агента</h1>
        <p style={{ color: color.mutedForeground, marginTop: 0 }}>Загрузка…</p>
        <div style={{ ...card, minHeight: 360 }} aria-hidden="true" />
      </main>
    );
  }

  return (
    <main id="main" style={main}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: space.md,
          marginBottom: 8,
        }}
      >
        <h1 style={{ ...titleStyle, margin: 0 }}>Админка агента</h1>
        <button type="button" onClick={onLogout} style={btnSecondary}>
          Выйти
        </button>
      </div>
      <p style={{ margin: "0 0 24px", color: color.mutedForeground, maxWidth: 640 }}>
        Промпт и модель хранятся в <code style={code}>data/agent.json</code>.
        Telegram-бот читает файл при каждом ответе — перезапуск не нужен.
      </p>

      {error && (
        <div
          ref={errorRef}
          id={formErrorId}
          role="alert"
          tabIndex={-1}
          style={alertError}
        >
          <strong style={{ display: "block", marginBottom: 4 }}>
            Не удалось выполнить действие
          </strong>
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ ...card, maxWidth: 720 }} noValidate>
        <div style={{ display: "flex", flexDirection: "column", gap: space.lg }}>
          <div>
            <label htmlFor={promptId} style={labelStyle}>
              Системный промпт
            </label>
            <p id={promptHintId} style={hintStyle}>
              Этот текст задаёт роль агента для всех чатов.
            </p>
            <textarea
              id={promptId}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                if (promptError) setPromptError(null);
              }}
              rows={10}
              required
              aria-invalid={promptError ? true : undefined}
              aria-describedby={promptDescribedBy}
              style={{
                ...fieldStyle,
                minHeight: 180,
                resize: "vertical",
                borderColor: promptError ? color.destructive : color.border,
              }}
            />
            {promptError && (
              <p id={promptErrorId} role="alert" style={fieldError}>
                {promptError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={modelId} style={labelStyle}>
              Модель
            </label>
            <p id={modelHintId} style={hintStyle}>
              Список доступных моделей задаётся на сервере.
            </p>
            <select
              id={modelId}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              aria-describedby={modelHintId}
              style={{ ...fieldStyle, maxWidth: 320, minHeight: 44 }}
            >
              {!models.includes(model) && (
                <option value={model}>{model}</option>
              )}
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={saving}
            aria-busy={saving}
            style={{ ...btnPrimary, alignSelf: "flex-start" }}
            data-cta="true"
          >
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </form>

      {message && (
        <p role="status" style={alertOk}>
          {message}
        </p>
      )}
    </main>
  );
}

const titleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: "clamp(26px, 4vw, 32px)",
  lineHeight: 1.2,
  letterSpacing: "-0.02em",
};

const labelStyle: CSSProperties = {
  display: "block",
  fontWeight: 600,
  marginBottom: 4,
};

const hintStyle: CSSProperties = {
  margin: "0 0 8px",
  color: color.mutedForeground,
  fontSize: 14,
  fontWeight: 400,
};

const fieldStyle: CSSProperties = {
  display: "block",
  width: "100%",
  font: "inherit",
  fontWeight: 400,
  padding: "12px 16px",
  border: `1px solid ${color.border}`,
  borderRadius: 8,
  background: color.card,
  color: color.foreground,
  transition: "border-color 200ms ease, box-shadow 200ms ease",
};

const fieldError: CSSProperties = {
  margin: "8px 0 0",
  color: color.destructive,
  fontSize: 14,
};

const alertError: CSSProperties = {
  maxWidth: 720,
  marginBottom: space.lg,
  padding: "12px 16px",
  borderRadius: 8,
  background: "#FEF2F2",
  color: color.destructive,
  border: `1px solid ${color.destructive}`,
};

const alertOk: CSSProperties = {
  maxWidth: 720,
  marginTop: space.md,
  padding: "12px 16px",
  borderRadius: 8,
  background: color.successBg,
  color: color.success,
  border: `1px solid #A7F3D0`,
};
