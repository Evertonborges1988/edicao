import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Agenda Bela",
  description: "Agenda e clientes para profissionais de beleza e bem-estar",
  manifest: "/manifest.webmanifest",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#be185d" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="mx-auto min-h-screen max-w-md bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
