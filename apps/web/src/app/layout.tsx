import type {
  Metadata,
  Viewport,
} from "next";

import "./globals.css";
import "katex/dist/katex.min.css";

import StructuredData from "./_components/StructuredData";

const SITE_URL = "https://accqudo.com";

const SITE_NAME = "Accqudo";

const LOGO_URL =
  "https://res.cloudinary.com/dcfofc9fa/image/upload/v1772563915/sa_logo_xzso0t.png";

const SITE_DESCRIPTION =
  "Prepare for competitive exams with online test series, mock tests, chapter-wise, topic-wise and subject-wise practice, exam-style tests, instant analytics and performance insights.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:
      "Accqudo — Online Test Series, Mock Tests & Exam Practice Platform",

    template: "%s | Accqudo",
  },

  description: SITE_DESCRIPTION,

  applicationName: SITE_NAME,

  category: "education",

  classification:
    "Online education, competitive exam preparation, test series and mock tests",

  authors: [
    {
      name: SITE_NAME,
    },
  ],

  creator: SITE_NAME,

  publisher: SITE_NAME,

  keywords: [
    // Brand
    'accqudo',
    'Accqudo',
    'accudo',
    'acudo',
    'acudo',
    'acdo test',
    "Accqudo test series",
    "Accqudo online test",
    "Accqudo mock test",
    "Accqudo exam preparation",

    // Core product
    "online test series",
    "online mock test",
    "mock tests",
    "online practice tests",
    "competitive exam test series",
    "competitive exam mock tests",
    "exam preparation platform",
    "online exam practice",
    "test series platform",
    "exam practice platform",

    // Learning hierarchy
    "chapter wise test",
    "chapter wise mock test",
    "topic wise test",
    "topic wise mock test",
    "subject wise test",
    "subject wise mock test",
    "full length mock test",
    "full mock test",
    "sectional mock test",
    "exam wise test series",

    // Exam technology
    "online exam simulator",
    "CBT mock test",
    "computer based test practice",
    "exam pattern practice",

    // Analytics
    "exam analytics",
    "test performance analysis",
    "mock test ranking",
    "test ranking",
    "exam performance analytics",

    // General India
    "competitive exams India",
    "competitive exam preparation India",
    "online exam preparation India",
    "student test series",
    "practice tests for students",

    // GATE
    "GATE mock test",
    "GATE test series",
    "GATE online test series",
    "GATE practice test",
    "GATE subject wise test",
    "GATE chapter wise test",

    // JEE
    "JEE mock test",
    "JEE test series",
    "JEE online test series",
    "JEE practice test",
    "JEE Main mock test",
    "JEE Advanced mock test",

    // NEET
    "NEET mock test",
    "NEET test series",
    "NEET online test series",
    "NEET practice test",
    "NEET subject wise test",
    "NEET chapter wise test",

    // UPSC
    "UPSC mock test",
    "UPSC test series",
    "UPSC online test series",
    "UPSC practice test",

    // SSC
    "SSC mock test",
    "SSC test series",
    "SSC online test series",
    "SSC practice test",

    // Banking
    "banking exam mock test",
    "banking test series",
    "bank exam mock test",
    "banking online test series",
    "IBPS mock test",
    "SBI mock test",
  ],

  verification: {
    google:
      "tuzzP8y-8tw4C3GfacAh3rXjbopDxJew4udvCkJOJNA",
  },

  icons: {
    icon: LOGO_URL,

    shortcut: LOGO_URL,

    apple: LOGO_URL,
  },

  manifest: "/manifest.webmanifest",

  openGraph: {
    type: "website",

    locale: "en_IN",

    url: SITE_URL,

    siteName: SITE_NAME,

    title:
      "Accqudo — Online Test Series, Mock Tests & Exam Practice Platform",

    description:
      "Practice competitive exams with online test series, mock tests, chapter-wise, topic-wise and subject-wise practice, exam-style tests and performance analytics.",

    images: [
      {
        url: LOGO_URL,

        width: 1200,

        height: 630,

        alt:
          "Accqudo — Online Test Series and Competitive Exam Practice Platform",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Accqudo — Online Test Series & Mock Tests",

    description:
      "Practice competitive exams with online test series, mock tests, chapter-wise, topic-wise and subject-wise practice.",

    images: [LOGO_URL],
  },

  robots: {
    index: true,

    follow: true,

    googleBot: {
      index: true,

      follow: true,

      "max-image-preview": "large",

      "max-snippet": -1,

      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: SITE_URL,

    languages: {
      "en-IN": SITE_URL,

      "x-default": SITE_URL,
    },
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  referrer: "origin-when-cross-origin",

  other: {
    "content-language": "en-IN",

    "geo.region": "IN",

    "geo.country": "India",

    "theme-color": "#14213D",
  },
};

export const viewport: Viewport = {
  width: "device-width",

  initialScale: 1,

  viewportFit: "cover",

  themeColor: "#14213D",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      suppressHydrationWarning
    >
      <body className="antialiased">
        <StructuredData />

        {children}
      </body>
    </html>
  );
}