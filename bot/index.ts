import { getTelegramBot } from "../lib/telegram-bot";
import { getSecrets } from "../lib/env";

async function main() {
  // Локально — polling. На Beget VPS бот работает через webhook в Next.js.
  getSecrets();
  const bot = getTelegramBot();

  console.info("[bot] Telegram bot started (polling)");
  await bot.start({
    onStart: (info) => {
      console.info(`[bot] @${info.username} is running`);
    },
  });
}

main().catch((err) => {
  console.error("[bot] Failed to start bot:", err);
  process.exit(1);
});
