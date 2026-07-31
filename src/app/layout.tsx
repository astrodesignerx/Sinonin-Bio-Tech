import type { ReactNode } from "react";
import "./globals.css";

// Locale-aware shell lives in app/[locale]/layout.tsx; this root layout is a
// pass-through so global styles also apply to non-locale routes (e.g. 404).
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
