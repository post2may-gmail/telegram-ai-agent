"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";
import { brand, headerBar, headerInner, nav, navLink } from "./theme";

const links = [
  { href: "/", label: "Главная" },
  { href: "/admin", label: "Админка" },
] as const;

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header style={headerBar}>
      <div style={headerInner}>
        <Link href="/" style={brand}>
          Проект 1
        </Link>
        <nav aria-label="Основная навигация" style={nav}>
          {links.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={navLink(active)}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function IconChat({ style }: { style?: CSSProperties }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d="M4 12a8 8 0 0 1 8-8h0a8 8 0 0 1 8 8v5a3 3 0 0 1-3 3H9l-4 3v-4.2A8 8 0 0 1 4 12Z" />
    </svg>
  );
}

export function IconFile({ style }: { style?: CSSProperties }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

export function IconHistory({ style }: { style?: CSSProperties }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

