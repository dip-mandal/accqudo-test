import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://accqudo.com'),

  title: {
    default: 'accqudo — Multi-Exam Test Series & Online Practice Platform',
    template: '%s | accqudo',
  },

  description:
    'Prepare for GATE, JEE, NEET, UPSC, SSC, Banking and other competitive exams with chapter-wise, topic-wise, subject-wise and full-length mock tests. Practice with real exam patterns, instant analytics and rankings.',

  keywords: [
    'accqudo',
    'online test series',
    'test series platform',
    'mock test',
    'online mock test',
    'competitive exam preparation',
    'exam preparation',
    'practice tests',
    'online exam practice',
    'GATE mock test',
    'GATE test series',
    'GATE preparation',
    'JEE mock test',
    'JEE test series',
    'NEET mock test',
    'NEET test series',
    'UPSC mock test',
    'UPSC test series',
    'SSC mock test',
    'SSC test series',
    'banking mock test',
    'chapter wise mock test',
    'topic wise test',
    'subject wise test',
    'full length mock test',
    'exam pattern mock test',
    'competitive exams online',
  ],

  authors: [{ name: 'accqudo' }],
  creator: 'accqudo',
  publisher: 'accqudo',

  verification: {
    google: 'tuzzP8y-8tw4C3GfacAh3rXjbopDxJew4udvCkJOJNA',
  },

  icons: {
    icon: '/logo_saas.jpg',
    shortcut: '/logo_saas.jpg',
    apple: '/logo_saas.jpg',
  },

  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://accqudo.com',
    siteName: 'accqudo',
    title: 'accqudo — Multi-Exam Test Series & Online Practice Platform',
    description:
      'Practice for competitive exams with chapter-wise, topic-wise, subject-wise and full-length mock tests, instant analytics and rankings.',
    images: [
      {
        url: '/logo_saas.jpg',
        width: 1200,
        height: 630,
        alt: 'accqudo — Multi-Exam Test Series Platform',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'accqudo — Multi-Exam Test Series Platform',
    description:
      'Practice smarter with real exam patterns, mock tests, instant analytics and rankings.',
    images: ['/logo_saas.jpg'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  alternates: {
    canonical: 'https://accqudo.com',
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