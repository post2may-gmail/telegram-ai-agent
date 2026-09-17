import { NextRequest, NextResponse } from "next/server";
import { webhookCallback } from "grammy";
import { getTelegramBot } from "@/lib/telegram-bot";
import { getDeployConfig } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { webhookSecret } = getDeployConfig();
    const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");

    if (webhookSecret) {
      if (!headerSecret || headerSecret !== webhookSecret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const bot = getTelegramBot();
    const handleUpdate = webhookCallback(bot, "std/http");
    return await handleUpdate(request);
  } catch (err) {
    console.error("[api] Telegram webhook failed:", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
