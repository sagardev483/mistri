import type { Metadata } from "next";
import { Rajdhani, Hind, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  weight: ["600", "700"],
  subsets: ["latin", "devanagari"],
});

const hind = Hind({
  variable: "--font-hind",
  weight: ["400", "500", "600"],
  subsets: ["latin", "devanagari"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mistri",
  description: "Find trusted local service providers",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${rajdhani.variable} ${hind.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col ">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <Navbar />
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}