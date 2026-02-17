import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResearchBrief UI",
  description: "Generate and analyze research briefs with AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-50">
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
          <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <a
                href="/"
                className="text-2xl font-bold text-accent flex items-center gap-2"
              >
                <svg
                  className="w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.3A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                </svg>
                ResearchBrief
              </a>

              <div className="flex gap-6">
                <a href="/" className="text-neutral-700 hover:text-neutral-900">
                  Home
                </a>
                <a href="/saved" className="text-neutral-700 hover:text-neutral-900">
                  Saved
                </a>
                <a href="/status" className="text-neutral-700 hover:text-neutral-900">
                  Status
                </a>
              </div>
            </div>
          </nav>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-neutral-200 bg-white mt-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-neutral-500 text-sm text-center">
              ResearchBrief UI v0.1.0 • Built with Next.js 14 & Tailwind CSS
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
