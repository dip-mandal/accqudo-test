import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';

export const metadata: Metadata = {
  title: 'accqudo — Multi-Exam Test Series Platform',
  description: 'Practice smarter with real exam patterns, instant analytics, and first-attempt ranking.',
  icons: {
    icon: '/logo_saas.jpg',
    shortcut: '/logo_saas.jpg',
    apple: '/logo_saas.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}