import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Vital Housing Dashboard",
  description: "Affordable housing portfolio management",
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
        {/* Mobile top padding */}
        <div className="lg:hidden h-12" />
        {/* Main content — offset by sidebar width on desktop */}
        <main className="lg:ml-[220px] min-h-screen">
          <div className="px-5 py-5 max-w-[1400px]">{children}</div>
        </main>
      </body>
    </html>
  );
}
