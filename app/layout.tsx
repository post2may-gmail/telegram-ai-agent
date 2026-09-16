import type { Metadata } from "next";
import { AppHeader } from "./chrome";
import { font, shell, skipLink } from "./theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Проект 1 — Telegram ИИ-агент",
  description: "Локальный Telegram-бот и админка настроек промпта и модели",
};

const themeBootScript = `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body
        style={{
          ...shell,
          margin: 0,
          fontFamily: font.sans,
        }}
      >
        <a href="#main" className="skip-link" style={skipLink}>
          К содержанию
        </a>
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
