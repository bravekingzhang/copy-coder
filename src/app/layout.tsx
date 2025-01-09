import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
        <div className="min-h-screen bg-gray-50 flex flex-col">
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
          <main className="flex-1 pt-16">
            <div className="container mx-auto p-6">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-12">
            <div className="container mx-auto py-8 px-6">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left side - WeChat Official Account */}
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold mb-4">关注我的微信公众号</h3>
                  <div className="flex flex-col items-center md:items-start">
                    <div className="text-xl font-bold text-gray-800 mb-2">老码小张</div>
                    <p className="text-gray-600 mb-4">
                      分享 AI 编程、全栈开发、效率工具等精彩内容
                    </p>
                    <Image
                      src="/wechat-qr.jpg"
                      alt="微信公众号二维码"
                      width={200}
                      height={200}
                      className="rounded-lg shadow-md"
                    />
                  </div>
                </div>

                {/* Right side - Appreciation */}
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold mb-4">赞赏支持</h3>
                  <p className="text-gray-600 mb-4">
                    如果这个工具对你有帮助，欢迎赞赏支持，让我能持续创作更多优质内容
                  </p>
                  <Image
                    src="/reward-qr.jpg"
                    alt="赞赏码"
                    width={200}
                    height={200}
                    className="rounded-lg shadow-md mx-auto md:mx-0"
                  />
                </div>
              </div>

              <div className="text-center mt-8 text-gray-500 text-sm">
                © 2025 Super Copy Coder. All rights reserved.
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
