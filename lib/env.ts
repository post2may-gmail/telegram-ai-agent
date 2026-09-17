import { existsSync, readFileSync } from "fs";
import path from "path";

export type AppSecrets = {
  apiGpt: string;
  telegramToken: string;
  adminLogin: string;
  adminPassword: string;
};

export type DeployConfig = {
  siteUrl: string;
  webhookSecret: string;
};

let cached: AppSecrets | null = null;

function loadEnfFile(): string | null {
  const candidates = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), "enf.local"),
    path.join(process.cwd(), "env.local"),
  ];
  for (const filePath of candidates) {
    if (existsSync(filePath)) {
      const raw = readFileSync(filePath, "utf8");
      // Убираем BOM, если файл сохранили из Windows-редактора
      return raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
    }
  }
  return null;
}

function parseKeyValueFile(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
    if (line.startsWith("#")) continue;
    // Формат enf.local: KEY value
    for (const key of [
      "API_GPT",
      "TOKEN_TELEGRAM",
      "ADMIN_LOGIN",
      "ADMIN_PASSWORD",
      "SITE_URL",
      "TELEGRAM_WEBHOOK_SECRET",
    ]) {
      if (line.startsWith(`${key} `)) {
        out[key] = line.slice(key.length + 1).trim();
      }
    }
    // Формат .env: KEY=value
    const eq = line.indexOf("=");
    if (eq > 0) {
      const k = line.slice(0, eq).trim();
      const v = line.slice(eq + 1).trim();
      if (k && !(k in out)) out[k] = v;
    }
  }
  return out;
}

function loadSecrets(): AppSecrets {
  const raw = loadEnfFile();
  const fromFile = raw ? parseKeyValueFile(raw) : {};

  const apiGpt = (process.env.API_GPT || fromFile.API_GPT || "").trim();
  const telegramToken = (
    process.env.TOKEN_TELEGRAM ||
    fromFile.TOKEN_TELEGRAM ||
    ""
  ).trim();
  const adminLogin = (
    process.env.ADMIN_LOGIN ||
    fromFile.ADMIN_LOGIN ||
    ""
  ).trim();
  const adminPassword = (
    process.env.ADMIN_PASSWORD ||
    fromFile.ADMIN_PASSWORD ||
    ""
  ).trim();

  if (!apiGpt) {
    console.error("[env] Не найден API_GPT (enf.local / .env.local или env)");
    throw new Error("Не найден API_GPT (enf.local / .env.local или env)");
  }
  if (!telegramToken) {
    console.error(
      "[env] Не найден TOKEN_TELEGRAM (enf.local / .env.local или env)",
    );
    throw new Error(
      "Не найден TOKEN_TELEGRAM (enf.local / .env.local или env)",
    );
  }
  if (!adminLogin) {
    console.error(
      "[env] Не найден ADMIN_LOGIN (enf.local / .env.local или env)",
    );
    throw new Error("Не найден ADMIN_LOGIN (enf.local / .env.local или env)");
  }
  if (!adminPassword) {
    console.error(
      "[env] Не найден ADMIN_PASSWORD (enf.local / .env.local или env)",
    );
    throw new Error(
      "Не найден ADMIN_PASSWORD (enf.local / .env.local или env)",
    );
  }

  return { apiGpt, telegramToken, adminLogin, adminPassword };
}

export function getSecrets(): AppSecrets {
  if (cached) return cached;
  cached = loadSecrets();
  return cached;
}

function normalizeSiteUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

/** Прод-настройки (process.env / .env.local / enf.local / env.local). */
export function getDeployConfig(): DeployConfig {
  const raw = loadEnfFile();
  const fromFile = raw ? parseKeyValueFile(raw) : {};

  return {
    siteUrl: normalizeSiteUrl(
      process.env.SITE_URL || fromFile.SITE_URL || "",
    ),
    webhookSecret: (
      process.env.TELEGRAM_WEBHOOK_SECRET ||
      fromFile.TELEGRAM_WEBHOOK_SECRET ||
      ""
    ).trim(),
  };
}
