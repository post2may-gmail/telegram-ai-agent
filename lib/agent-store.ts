import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export const AVAILABLE_MODELS = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1-mini",
  "gpt-4.1",
  "o4-mini",
] as const;

export type AgentModel = (typeof AVAILABLE_MODELS)[number] | string;

export type AgentSettings = {
  prompt: string;
  model: AgentModel;
};

const DEFAULT_SETTINGS: AgentSettings = {
  prompt:
    "Ты полезный ассистент в Telegram. Отвечай кратко и по делу на языке пользователя.",
  model: "gpt-4o-mini",
};

function dataDir(): string {
  // На Vercel файловая система приложения read-only; пишем в /tmp.
  if (process.env.VERCEL) {
    return path.join("/tmp", "agent-data");
  }
  return path.join(process.cwd(), "data");
}

function settingsPath(): string {
  return path.join(dataDir(), "agent.json");
}

function bundledSettingsPath(): string {
  return path.join(process.cwd(), "data", "agent.json");
}

function ensureDataDir() {
  const dir = dataDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function normalize(parsed: Partial<AgentSettings>): AgentSettings {
  return {
    prompt:
      typeof parsed.prompt === "string" && parsed.prompt.trim()
        ? parsed.prompt
        : DEFAULT_SETTINGS.prompt,
    model:
      typeof parsed.model === "string" && parsed.model.trim()
        ? parsed.model
        : DEFAULT_SETTINGS.model,
  };
}

export function readAgentSettings(): AgentSettings {
  ensureDataDir();
  const livePath = settingsPath();

  if (!existsSync(livePath) && process.env.VERCEL) {
    const bundled = bundledSettingsPath();
    if (existsSync(bundled)) {
      try {
        const seeded = normalize(
          JSON.parse(readFileSync(bundled, "utf8")) as Partial<AgentSettings>,
        );
        writeFileSync(livePath, JSON.stringify(seeded, null, 2), "utf8");
        return seeded;
      } catch (err) {
        console.warn("[store] Не удалось прочитать bundled agent.json:", err);
      }
    }
  }

  if (!existsSync(livePath)) {
    writeAgentSettings(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const raw = readFileSync(livePath, "utf8");
    return normalize(JSON.parse(raw) as Partial<AgentSettings>);
  } catch (err) {
    console.warn("[store] Битый agent.json, используем дефолты:", err);
    return { ...DEFAULT_SETTINGS };
  }
}

export function writeAgentSettings(settings: AgentSettings): AgentSettings {
  ensureDataDir();
  const next: AgentSettings = {
    prompt: settings.prompt.trim() || DEFAULT_SETTINGS.prompt,
    model: settings.model.trim() || DEFAULT_SETTINGS.model,
  };
  writeFileSync(settingsPath(), JSON.stringify(next, null, 2), "utf8");
  return next;
}
