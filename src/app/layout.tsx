import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Transcriber App",
  description: "AI-powered voice dictation and transcription",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full bg-background">
      <body className={inter.className + " min-h-full"}>
        {children}
      </body>
    </html>
  );
}
