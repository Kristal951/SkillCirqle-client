import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@fontsource-variable/material-symbols-outlined/full.css";
import OneSignalProvider from "@/providers/oneSignal";
import OneSignalLoginSync from "@/providers/OneSignalLoginSync";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "SkillCirqle",
  description:
    "SkillCirqle is a social learning and skill-sharing platform where people teach what they know and learn from others.",
  icons: {
    icon: "/favicon.svg",
  },
  keywords: [
    "SkillCirqle",
    "SkillCirqle website",
    "social learning",
    "student collaboration",
    "learning community",
    "skill sharing",
  ],
  verification: {
    google: "o69Wow980Wxey5Z8w21CIYc29IDAKOEbUp0W6dgzuAY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          defer
        ></script>
      </head>
      <body className={`antialiased`}>
        <OneSignalProvider />
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
