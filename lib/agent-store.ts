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

const DATA_DIR = path.join(process.cwd(), "data");
const SETTINGS_PATH = path.join(DATA_DIR, "agent.json");

const DEFAULT_SETTINGS: AgentSettings = {
  prompt:
    "Ты полезный ассистент в Telegram. Отвечай кратко и по делу на языке пользователя.",
  model: "gpt-4o-mini",
};

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

export function readAgentSettings(): AgentSettings {
  ensureDataDir();
  if (!existsSync(SETTINGS_PATH)) {
    writeAgentSettings(DEFAULT_SETTINGS);
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const raw = readFileSync(SETTINGS_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<AgentSettings>;
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
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function writeAgentSettings(settings: AgentSettings): AgentSettings {
  ensureDataDir();
  const next: AgentSettings = {
    prompt: settings.prompt.trim() || DEFAULT_SETTINGS.prompt,
    model: settings.model.trim() || DEFAULT_SETTINGS.model,
  };
  writeFileSync(SETTINGS_PATH, JSON.stringify(next, null, 2), "utf8");
  return next;
}
