import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import CommandCenter from "@/components/CommandCenter";

export const metadata: Metadata = {
  title: "Vital Housing Dashboard",
  description: "Affordable housing portfolio management — Vital Housing Group",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Sidebar />
        <main className="min-h-screen pt-12 lg:pt-0">
          <div className="px-4 sm:px-5 py-5 max-w-[1400px]">{children}</div>
        </main>
        <CommandCenter />
      </body>
    </html>
  );
}
