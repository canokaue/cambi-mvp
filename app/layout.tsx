import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/utils/css";
import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cambi",
  description: "Permissionless Bitcoin-backed yield protocol powered by tokenized Latin American bonds and receivables",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          `${openSans.variable} antialiased`,
          // For now this will always dark, for simplicity, we may change this later
          // "dark",
        )}
      >
        <Providers>
          {children}
          <Toaster closeButton expand richColors />
        </Providers>
      </body>
    </html>
  );
}
