import Link from "next/link";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
        background: "#EEF2ED",
        color: "#14213D",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "680px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            marginBottom: "12px",
            fontFamily: "monospace",
            fontSize: "14px",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#A9791F",
          }}
        >
          404
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(36px, 7vw, 64px)",
            lineHeight: 1.05,
            fontWeight: 700,
          }}
        >
          Page not found
        </h1>

        <p
          style={{
            marginTop: "20px",
            marginBottom: "28px",
            color: "#4B5768",
            fontSize: "17px",
            lineHeight: 1.7,
          }}
        >
          The page you are looking for does not
          exist or may have moved.
        </p>

        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 20px",
            borderRadius: "8px",
            background: "#14213D",
            color: "#FFFFFF",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          Back to Accqudo
        </Link>
      </section>
    </main>
  );
}