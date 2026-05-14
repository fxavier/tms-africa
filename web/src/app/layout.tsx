import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "LogiTrack Pro | TMS",
  description: "Transport Management System enterprise frontend built with Next.js, TypeScript and TailwindCSS.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
