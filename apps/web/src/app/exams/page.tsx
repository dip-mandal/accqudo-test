import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Competitive Exams — Test Series & Mock Tests",

  description:
    "Explore competitive exam test series, mock tests and structured online practice on Accqudo.",

  alternates: {
    canonical: "https://accqudo.com/exams",
  },

  openGraph: {
    type: "website",

    url: "https://accqudo.com/exams",

    title:
      "Competitive Exams — Test Series & Mock Tests | Accqudo",

    description:
      "Explore competitive exam test series, mock tests and structured online practice on Accqudo.",
  },
};

export default function ExamsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 24px",
        background: "#EEF2ED",
        color: "#14213D",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontFamily: "monospace",
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#A9791F",
          }}
        >
          Accqudo / Exams
        </p>

        <h1
          style={{
            marginTop: "12px",
            fontSize: "clamp(36px, 6vw, 64px)",
            lineHeight: 1.05,
          }}
        >
          Competitive Exams
        </h1>

        <p
          style={{
            maxWidth: "760px",
            marginTop: "20px",
            color: "#4B5768",
            fontSize: "18px",
            lineHeight: 1.7,
          }}
        >
          Explore online test series, mock tests,
          subject-wise practice, chapter-wise tests
          and topic-wise practice available on Accqudo.
        </p>

        <div
          style={{
            marginTop: "40px",
            padding: "24px",
            background: "#F8FAF7",
            border: "1px solid #CBD3C7",
          }}
        >
          <h2>Exam preparation on Accqudo</h2>

          <p
            style={{
              color: "#4B5768",
              lineHeight: 1.7,
            }}
          >
            Accqudo organizes practice material according
            to the examination structure configured by
            the platform. Available exam streams, packages,
            subjects, chapters, topics and test papers are
            managed through the Accqudo platform.
          </p>
        </div>
      </div>
    </main>
  );
}