const SITE_URL = "https://accqudo.com";

const LOGO_URL =
  "https://res.cloudinary.com/dcfofc9fa/image/upload/v1772563915/sa_logo_xzso0t.png";

const SUPPORT_EMAIL = "accqudo@gmail.com";

export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",

    "@type": "EducationalOrganization",

    "@id": `${SITE_URL}/#organization`,

    name: "Accqudo",

    url: SITE_URL,

    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
    },

    description:
      "Accqudo is an online educational test-preparation platform providing test series, mock tests, chapter-wise practice, topic-wise practice, subject-wise tests and performance analytics.",

    email: SUPPORT_EMAIL,

    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",

    "@type": "WebSite",

    "@id": `${SITE_URL}/#website`,

    url: SITE_URL,

    name: "Accqudo",

    alternateName: [
      "accqudo",
      "Accqudo Test Series",
      "Accqudo Online Test Series",
    ],

    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },

    inLanguage: "en-IN",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            organizationSchema
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            websiteSchema
          ),
        }}
      />
    </>
  );
}