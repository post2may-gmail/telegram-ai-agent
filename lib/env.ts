import { existsSync, readFileSync } from "fs";
import path from "path";

export type AppSecrets = {
  apiGpt: string;
  telegramToken: string;
  adminLogin: string;
  adminPassword: string;
};

let cached: AppSecrets | null = null;

function valueFromEnf(lines: string[], prefix: string): string {
  for (const line of lines) {
    if (line.startsWith(`${prefix} `)) {
      return line.slice(prefix.length + 1).trim();
    }
  }
  return "";
}

function parseEnfLocal(raw: string): Partial<AppSecrets> {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return {
    apiGpt: valueFromEnf(lines, "API_GPT"),
    telegramToken: valueFromEnf(lines, "TOKEN_TELEGRAM"),
    adminLogin: valueFromEnf(lines, "ADMIN_LOGIN"),
    adminPassword: valueFromEnf(lines, "ADMIN_PASSWORD"),
  };
}

function loadSecrets(): AppSecrets {
  let fromFile: Partial<AppSecrets> = {};
  const filePath = path.join(process.cwd(), "enf.local");
  if (existsSync(filePath)) {
    fromFile = parseEnfLocal(readFileSync(filePath, "utf8"));
  }

  const apiGpt = (process.env.API_GPT || fromFile.apiGpt || "").trim();
  const telegramToken = (
    process.env.TOKEN_TELEGRAM ||
    fromFile.telegramToken ||
    ""
  ).trim();
  const adminLogin = (
    process.env.ADMIN_LOGIN ||
    fromFile.adminLogin ||
    ""
  ).trim();
  const adminPassword = (
    process.env.ADMIN_PASSWORD ||
    fromFile.adminPassword ||
    ""
  ).trim();

  if (!apiGpt) {
    console.error("[env] Не найден API_GPT (enf.local или env)");
    throw new Error("Не найден API_GPT (enf.local или env)");
  }
  if (!telegramToken) {
    console.error("[env] Не найден TOKEN_TELEGRAM (enf.local или env)");
    throw new Error("Не найден TOKEN_TELEGRAM (enf.local или env)");
  }
  if (!adminLogin) {
    console.error("[env] Не найден ADMIN_LOGIN (enf.local или env)");
    throw new Error("Не найден ADMIN_LOGIN (enf.local или env)");
  }
  if (!adminPassword) {
    console.error("[env] Не найден ADMIN_PASSWORD (enf.local или env)");
    throw new Error("Не найден ADMIN_PASSWORD (enf.local или env)");
  }

  return { apiGpt, telegramToken, adminLogin, adminPassword };
}

export function getSecrets(): AppSecrets {
  if (cached) return cached;
  cached = loadSecrets();
  return cached;
}
