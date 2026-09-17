import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getDeployConfig, getSecrets } from "@/lib/env";
import { getTelegramBot } from "@/lib/telegram-bot";

export const runtime = "nodejs";

export async function POST() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  try {
    const { siteUrl, webhookSecret } = getDeployConfig();
    if (!siteUrl) {
      return NextResponse.json(
        { error: "Задайте SITE_URL в .env.local" },
        { status: 400 },
      );
    }

    const webhookUrl = `${siteUrl.replace(/\/$/, "")}/api/telegram/webhook`;
    const bot = getTelegramBot();

    await bot.api.setWebhook(webhookUrl, {
      secret_token: webhookSecret || undefined,
      drop_pending_updates: true,
    });

    getSecrets();
    console.info("[api] Telegram webhook set");
    return NextResponse.json({ ok: true, webhookUrl });
  } catch (err) {
    console.error("[api] setWebhook failed:", err);
    return NextResponse.json(
      { error: "Не удалось установить webhook" },
      { status: 500 },
    );
  }
}
