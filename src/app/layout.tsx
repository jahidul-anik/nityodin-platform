import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nityodin - Single Identity, Multiple Roles | Citizen-Centric Digital Ecosystem",
  description: "Nityodin unites merchants, service providers, and consumers on a single, unified platform. One verified identity, one unified wallet, endless possibilities across Bangladesh.",
  keywords: ["Nityodin", "Bangladesh", "digital ecosystem", "super app", "MFS", "bKash", "Nagad", "e-commerce", "PoS"],
  authors: [{ name: "Nityodin Team" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "Nityodin - Citizen-Centric Digital Ecosystem",
    description: "Single Identity, Multiple Roles. The future of digital Bangladesh.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}