import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM",
  description: "Klijenti — Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  );
}
