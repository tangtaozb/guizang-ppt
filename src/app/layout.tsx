import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/i18n-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

const SITE_URL = "https://www.artifyslide.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ArtifySlide — AI 高级杂志风格 PPT 生成器",
    template: "%s · ArtifySlide",
  },
  description:
    "粘贴文字，ArtifySlide 用杂志感和瑞士设计的排版语法，生成可对话编辑的横向翻页 HTML 演示文稿。9 套编辑风格主题，单文件下载，无需安装。",
  keywords: [
    "AI PPT",
    "AI 演示文稿",
    "AI presentation generator",
    "magazine style PPT",
    "杂志风 PPT",
    "AI 生成 PPT",
    "HTML 演示文稿",
    "horizontal slide deck",
  ],
  authors: [{ name: "ArtifySlide" }],
  creator: "ArtifySlide",
  publisher: "ArtifySlide",
  alternates: {
    canonical: "/",
    languages: {
      "zh-CN": "/",
      "en-US": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US"],
    url: SITE_URL,
    siteName: "ArtifySlide",
    title: "ArtifySlide — AI 高级杂志风格 PPT 生成器",
    description:
      "粘贴文字，AI 自动生成杂志风格 HTML 演示文稿。可对话编辑，9 套编辑级主题，单文件下载。",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ArtifySlide",
    creator: "@ArtifySlide",
    title: "ArtifySlide — AI 高级杂志风格 PPT 生成器",
    description:
      "粘贴文字，AI 自动生成杂志风格 HTML 演示文稿。可对话编辑，9 套编辑级主题，单文件下载。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // GSC「网址前缀」https://www.artifyslide.com 验证。
    // 同时上传了 public/google2b713bdf7d8775f3.html，meta 这行属于双保险。
    google: "2b713bdf7d8775f3",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
