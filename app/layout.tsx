import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth-provider";
import { AiConsultantWrapper } from "@/components/ai-consultant-wrapper";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "BookStore | Лучшие книги",
  description: "Интернет-магазин книг",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className={cn("min-h-screen bg-background font-sans antialiased flex flex-col", geistSans.variable, geistMono.variable)}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <AiConsultantWrapper />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
