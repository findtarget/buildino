// src/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "../app/context/ThemeContext";
import { SettingsProvider } from "../app/context/SettingsContext"; // F: ایمپورت کردن SettingsProvider
import PageTransition from "./page-transition";
import ClientLayoutWrapper from "./ClientLayoutWrapper";

const vazirmatn = localFont({
  src: [
    { path: "../../public/fonts/Vazirmatn-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Vazirmatn-Bold.woff2", weight: "700", style: "bold" }
  ],
  variable: "--font-vazirmatn",
  display: "swap"
});

export const metadata: Metadata = {
  title: "سامانه مدیریت ساختمان",
  description: "مدیریت، گزارش‌گیری و اتوماسیون ساختمان",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} font-vazirmatn antialiased`}>
        <ThemeProvider>
          {/* F: SettingsProvider باید در اینجا تمام برنامه را در بر بگیرد */}
          <SettingsProvider>
            <PageTransition>
              <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
            </PageTransition>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
