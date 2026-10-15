import type { Metadata } from "next";
import "./globals.css";
import { vazirmatn } from "./fonts";

const title = "هزارتو | شرکت فناوری و نوآوری شناخت";
const description =
  "هزارتو سامانه‌های بازی‌وار، محیط‌های یادگیری غوطه‌ور و رسانه‌ی هوشمند می‌سازد؛ در برخورد واقعیت گسترده، هوش مصنوعی، طراحی بازی و علوم شناختی.";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL("https://soul498.github.io/hezartoo/"),
  alternates: { canonical: "./" },
  openGraph: {
    title,
    description,
    locale: "fa_IR",
    type: "website",
    url: "https://soul498.github.io/hezartoo/",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fa" dir="rtl" data-scroll-behavior="smooth" className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
