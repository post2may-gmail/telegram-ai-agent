import { existsSync, readFileSync } from "fs";
import path from "path";

export type AppSecrets = {
  apiGpt: string;
  telegramToken: string;
  adminLogin: string;
  adminPassword: string;
};

export type AdminAuthSecrets = {
  adminLogin: string;
  adminPassword: string;
};

export type DeployConfig = {
  siteUrl: string;
  webhookSecret: string;
};

let cached: AppSecrets | null = null;

function findProjectRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    if (existsSync(path.join(dir, "package.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Beget: типичный путь приложения
  if (existsSync("/var/www/html/package.json")) return "/var/www/html";
  return process.cwd();
}

function loadEnfFile(): string | null {
  const root = findProjectRoot();
  const candidates = [
    path.join(root, ".env.local"),
    path.join(root, "enf.local"),
    path.join(root, "env.local"),
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), "enf.local"),
    path.join(process.cwd(), "env.local"),
  ];
  for (const filePath of candidates) {
    if (existsSync(filePath)) {
      const raw = readFileSync(filePath, "utf8");
      return raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
    }
  }
  console.error("[env] Файл секретов не найден. Искали в:", candidates.join(", "));
  return null;
}

function stripQuotes(value: string): string {
  const v = value.trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  return v;
}

function parseKeyValueFile(raw: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)) {
    if (line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq > 0) {
      const k = line.slice(0, eq).trim();
      const v = stripQuotes(line.slice(eq + 1).trim());
      if (k) out[k] = v;
      continue;
    }

    // Формат enf.local: KEY value
    const sp = line.indexOf(" ");
    if (sp > 0) {
      const k = line.slice(0, sp).trim();
      const v = stripQuotes(line.slice(sp + 1).trim());
      if (k) out[k] = v;
    }
  }
  return out;
}

function readMerged(): Record<string, string> {
  const raw = loadEnfFile();
  const fromFile = raw ? parseKeyValueFile(raw) : {};
  // Файл (.env.local) важнее process.env: Next кэширует env при старте процесса.
  const pick = (key: string) =>
    (fromFile[key] || process.env[key] || "").trim();
  return {
    API_GPT: pick("API_GPT"),
    TOKEN_TELEGRAM: pick("TOKEN_TELEGRAM"),
    ADMIN_LOGIN: pick("ADMIN_LOGIN"),
    ADMIN_PASSWORD: pick("ADMIN_PASSWORD"),
    SITE_URL: pick("SITE_URL"),
    TELEGRAM_WEBHOOK_SECRET: pick("TELEGRAM_WEBHOOK_SECRET"),
  };
}

/** Только для входа в админку — каждый раз читаем файл (без кэша). */
export function getAdminAuthSecrets(): AdminAuthSecrets {
  const merged = readMerged();
  if (!merged.ADMIN_LOGIN) {
    console.error("[env] Не найден ADMIN_LOGIN");
    throw new Error("Не найден ADMIN_LOGIN");
  }
  if (!merged.ADMIN_PASSWORD) {
    console.error("[env] Не найден ADMIN_PASSWORD");
    throw new Error("Не найден ADMIN_PASSWORD");
  }

  return {
    adminLogin: merged.ADMIN_LOGIN,
    adminPassword: merged.ADMIN_PASSWORD,
  };
}

function loadSecrets(): AppSecrets {
  const merged = readMerged();
  const admin = getAdminAuthSecrets();

  if (!merged.API_GPT) {
    console.error("[env] Не найден API_GPT");
    throw new Error("Не найден API_GPT");
  }
  if (!merged.TOKEN_TELEGRAM) {
    console.error("[env] Не найден TOKEN_TELEGRAM");
    throw new Error("Не найден TOKEN_TELEGRAM");
  }

  return {
    apiGpt: merged.API_GPT,
    telegramToken: merged.TOKEN_TELEGRAM,
    adminLogin: admin.adminLogin,
    adminPassword: admin.adminPassword,
  };
}

export function getSecrets(): AppSecrets {
  if (cached) return cached;
  cached = loadSecrets();
  return cached;
}

function normalizeSiteUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

export function getDeployConfig(): DeployConfig {
  const merged = readMerged();
  return {
    siteUrl: normalizeSiteUrl(merged.SITE_URL),
    webhookSecret: merged.TELEGRAM_WEBHOOK_SECRET,
  };
}
