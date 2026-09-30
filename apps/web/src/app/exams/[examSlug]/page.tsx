import type { Metadata } from "next";
import { notFound } from "next/navigation";

const SITE_URL = "https://accqudo.com";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api.accqudo.com/api/v1";

interface Exam {
  id: string | number;

  name: string;

  slug: string;

  description?: string | null;

  short_description?: string | null;

  is_published?: boolean;
}

interface PageProps {
  params: Promise<{
    examSlug: string;
  }>;
}

async function getExam(
  slug: string
): Promise<Exam | null> {
  /*
   * IMPORTANT:
   *
   * This expects a public endpoint:
   *
   * GET /public/exams/{slug}
   *
   * If your backend uses a different endpoint,
   * change ONLY this URL.
   */

  try {
    const response = await fetch(
      `${API_BASE}/public/exams/${encodeURIComponent(
        slug
      )}`,
      {
        next: {
          revalidate: 3600,
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const exam = (await response.json()) as Exam;

    if (exam.is_published === false) {
      return null;
    }

    return exam;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { examSlug } = await params;

  const exam = await getExam(examSlug);

  if (!exam) {
    return {
      title: "Exam Not Found",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description =
    exam.short_description ||
    exam.description ||
    `Practice ${exam.name} with online test series, mock tests and structured exam preparation on Accqudo.`;

  const canonical =
    `${SITE_URL}/exams/${exam.slug}`;

  return {
    title:
      `${exam.name} Mock Tests & Test Series`,

    description,

    alternates: {
      canonical,
    },

    robots: {
      index: true,
      follow: true,
    },

    openGraph: {
      type: "website",

      url: canonical,

      title:
        `${exam.name} Mock Tests & Test Series | Accqudo`,

      description,

      siteName: "Accqudo",
    },

    twitter: {
      card: "summary_large_image",

      title:
        `${exam.name} Mock Tests & Test Series | Accqudo`,

      description,
    },
  };
}

export default async function ExamPage({
  params,
}: PageProps) {
  const { examSlug } = await params;

  const exam = await getExam(examSlug);

  if (!exam) {
    notFound();
  }

  const description =
    exam.description ||
    `Practice ${exam.name} with online test series and mock tests on Accqudo.`;

  const canonical =
    `${SITE_URL}/exams/${exam.slug}`;

  const breadcrumbSchema = {
    "@context": "https://schema.org",

    "@type": "BreadcrumbList",

    itemListElement: [
      {
        "@type": "ListItem",

        position: 1,

        name: "Home",

        item: SITE_URL,
      },

      {
        "@type": "ListItem",

        position: 2,

        name: "Exams",

        item: `${SITE_URL}/exams`,
      },

      {
        "@type": "ListItem",

        position: 3,

        name: exam.name,

        item: canonical,
      },
    ],
  };

  const webpageSchema = {
    "@context": "https://schema.org",

    "@type": "WebPage",

    "@id": `${canonical}#webpage`,

    url: canonical,

    name:
      `${exam.name} Mock Tests & Test Series | Accqudo`,

    description,

    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },

    about: {
      "@id": `${SITE_URL}/#organization`,
    },

    inLanguage: "en-IN",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#EEF2ED",
        color: "#14213D",
        padding: "40px 24px",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            webpageSchema
          ),
        }}
      />

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{
            fontFamily: "monospace",
            fontSize: "13px",
            color: "#4B5768",
          }}
        >
          <a href="/">Home</a>
          {" / "}
          <a href="/exams">Exams</a>
          {" / "}
          <span>{exam.name}</span>
        </nav>

        <section
          style={{
            marginTop: "32px",
            padding: "36px",
            background: "#F8FAF7",
            border: "1px solid #CBD3C7",
          }}
        >
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "13px",
              color: "#A9791F",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Accqudo Exam Preparation
          </p>

          <h1
            style={{
              marginTop: "12px",
              fontSize: "clamp(36px, 6vw, 64px)",
              lineHeight: 1.05,
            }}
          >
            {exam.name} Mock Tests & Test Series
          </h1>

          <p
            style={{
              marginTop: "20px",
              maxWidth: "800px",
              color: "#4B5768",
              fontSize: "18px",
              lineHeight: 1.7,
            }}
          >
            {description}
          </p>
        </section>

        <section
          style={{
            marginTop: "24px",
            display: "grid",
            gap: "20px",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          <div
            style={{
              padding: "24px",
              background: "#F8FAF7",
              border: "1px solid #CBD3C7",
            }}
          >
            <h2>Test Series</h2>

            <p
              style={{
                color: "#4B5768",
                lineHeight: 1.6,
              }}
            >
              Practice with examination-oriented test
              series configured for this exam.
            </p>
          </div>

          <div
            style={{
              padding: "24px",
              background: "#F8FAF7",
              border: "1px solid #CBD3C7",
            }}
          >
            <h2>Mock Tests</h2>

            <p
              style={{
                color: "#4B5768",
                lineHeight: 1.6,
              }}
            >
              Attempt full-length and other available
              mock tests.
            </p>
          </div>

          <div
            style={{
              padding: "24px",
              background: "#F8FAF7",
              border: "1px solid #CBD3C7",
            }}
          >
            <h2>Structured Practice</h2>

            <p
              style={{
                color: "#4B5768",
                lineHeight: 1.6,
              }}
            >
              Explore available subjects, chapters,
              topics and test papers.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}