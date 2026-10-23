import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "./header";
import { QaStrip } from "./qa-strip";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barber HK",
  description: "A bilingual brief to show a Hong Kong men's barber.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col">
        <Header />
        <Suspense fallback={null}>
          <QaStrip />
        </Suspense>
        <div className="flex-1">{children}</div>
        <footer className="site-footer">
          Photo not stored · <span lang="zh-HK">相片唔會存</span>
        </footer>
      </body>
    </html>
  );
}
