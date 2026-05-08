import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rose Window',
  description: 'A stained-glass auction game for 1–3 players.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
