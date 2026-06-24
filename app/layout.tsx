import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
      <body className={`antialiased`}>
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
