import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Search } from "lucide-react";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Copy Coder - AI Prompt Generator",
  description: "Create powerful prompts for AI coders using images",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {/* Top Header */}
          <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
            <div className="flex items-center justify-between h-full px-4">
              <Link href="/" className="text-2xl font-bold">Super Copy Coder</Link>
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="pt-16">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
