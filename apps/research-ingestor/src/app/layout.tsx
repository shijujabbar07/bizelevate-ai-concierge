import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Research Ingestor — BizElevate',
  description: 'YouTube research ingestion tool',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen">
        <nav className="border-b border-gray-800 bg-gray-900 px-6 py-3 flex gap-6 items-center">
          <span className="font-bold text-blue-400 mr-4">Research Ingestor</span>
          <Link href="/" className="text-gray-300 hover:text-white text-sm">Search</Link>
          <Link href="/queue" className="text-gray-300 hover:text-white text-sm">Queue</Link>
          <Link href="/library" className="text-gray-300 hover:text-white text-sm">Library</Link>
          <Link href="/index-viewer" className="text-gray-300 hover:text-white text-sm">Indexes</Link>
        </nav>
        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
