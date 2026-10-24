import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Header } from "./header";
import { OfflineNote } from "./offline-note";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Barber HK",
  description: "A bilingual brief to show a Hong Kong men's barber.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || "local";

  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <OfflineNote />
        <div className="flex-1">{children}</div>
        <footer className="px-4 py-3 text-xs text-stone-600">
          <p data-deploy-sha={sha}>
            Deploy SHA: <code>{sha}</code>
          </p>
        </footer>
      </body>
    </html>
  );
}
