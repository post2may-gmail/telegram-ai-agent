import { readFileSync } from "fs";
import path from "path";

export type AppSecrets = {
  apiGpt: string;
  telegramToken: string;
};

let cached: AppSecrets | null = null;

function parseEnfLocal(raw: string): AppSecrets {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let apiGpt = "";
  let telegramToken = "";

  for (const line of lines) {
    if (line.startsWith("API_GPT ")) {
      apiGpt = line.slice("API_GPT ".length).trim();
    } else if (line.startsWith("TOKEN TELEGRAM ")) {
      telegramToken = line.slice("TOKEN TELEGRAM ".length).trim();
    }
  }

  if (!apiGpt) throw new Error("В enf.local не найден API_GPT");
  if (!telegramToken) throw new Error("В enf.local не найден TOKEN TELEGRAM");

  return { apiGpt, telegramToken };
}

export function getSecrets(): AppSecrets {
  if (cached) return cached;

  const filePath = path.join(process.cwd(), "enf.local");
  const raw = readFileSync(filePath, "utf8");
  cached = parseEnfLocal(raw);
  return cached;
}
