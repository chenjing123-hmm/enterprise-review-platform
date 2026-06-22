import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import { DisclaimerBanner } from "@/components/compliance/DisclaimerBanner";
import { CookieConsent } from "@/components/compliance/CookieConsent";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "企业点评 - 真实员工评价平台",
  description: "查看真实员工对企业的评价，了解公司待遇、工作环境和发展前景，帮助你做出更明智的职业选择。",
  keywords: ["企业点评", "员工评价", "公司评价", "职场", "面试", "工资待遇"],
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-slate-900 min-h-screen">
        <Providers>
          <DisclaimerBanner />
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <CookieConsent />
        </Providers>
      </body>
    </html>
  );
}