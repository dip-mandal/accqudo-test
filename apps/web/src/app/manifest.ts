import type { MetadataRoute } from "next";

const LOGO_URL =
  "https://res.cloudinary.com/dcfofc9fa/image/upload/v1772563915/sa_logo_xzso0t.png";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Accqudo — Online Test Series & Exam Practice Platform",

    short_name: "Accqudo",

    description:
      "Practice competitive exams with online test series, mock tests, chapter-wise, topic-wise and subject-wise tests, exam-style practice and performance analytics.",

    start_url: "/",

    scope: "/",

    display: "standalone",

    background_color: "#EEF2ED",

    theme_color: "#14213D",

    orientation: "portrait-primary",

    lang: "en-IN",

    dir: "ltr",

    icons: [
      {
        src: LOGO_URL,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}