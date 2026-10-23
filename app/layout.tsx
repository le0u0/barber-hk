import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist } from "next/font/google";
import { Header } from "./header";
import { QaStrip } from "./qa-strip";
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
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Header />
        <Suspense fallback={null}>
          <QaStrip />
        </Suspense>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
