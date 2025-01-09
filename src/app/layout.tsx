import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Search, Menu } from "lucide-react";
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
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg lg:hidden">
                  <Menu className="w-5 h-5" />
                </button>
                <Link href="/" className="text-2xl font-bold">Copy Coder</Link>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Left Sidebar */}
          <aside className="fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 hidden lg:block">
            <nav className="p-4">
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg">
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link href="/history" className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg">
                    <span>History</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="pt-16 lg:pl-64">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
