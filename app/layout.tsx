import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Header } from "./header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Barber HK",
  description: "A bilingual brief to show a Hong Kong men's barber.",
  applicationName: "Barber HK",
  appleWebApp: {
    capable: true,
    title: "Barber HK",
    statusBarStyle: "default",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1915",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || "local";

  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
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
