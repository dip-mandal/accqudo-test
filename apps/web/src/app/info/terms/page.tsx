import { InfoShell } from "../_components/InfoShell";

export const metadata = {
  title: "Terms of Use | Accqudo",
  description:
    "Terms governing use of the Accqudo online exam-practice platform.",
};

export default function TermsPage() {
  return (
    <InfoShell
      title="Terms of Use"
      eyebrow="Accqudo · Terms"
    >
      <style>{`
        .terms-page {
          --navy: #14213D;
          --navy-deep: #0B1428;
          --gold: #A9791F;
          --gold-light: #D5B45A;
          --cream: #F7F5EE;
          --cream-dark: #EEF2ED;
          --text: #263247;
          --muted: #667085;
          --border: rgba(20, 33, 61, 0.10);
          --white: #FFFFFF;

          position: relative;
          overflow: hidden;
          color: var(--text);
        }

        /* =========================================
           HERO
        ========================================= */

        .terms-hero {
          position: relative;
          overflow: hidden;

          margin-bottom: 42px;
          padding: 42px 34px;

          border: 1px solid
            rgba(20, 33, 61, 0.08);

          border-radius: 24px;

          background:
            radial-gradient(
              circle at 87% 13%,
              rgba(213, 180, 90, 0.20),
              transparent 28%
            ),
            radial-gradient(
              circle at 10% 90%,
              rgba(20, 33, 61, 0.08),
              transparent 32%
            ),
            linear-gradient(
              135deg,
              #F9F8F3 0%,
              #EEF2ED 100%
            );

          box-shadow:
            0 18px 50px
              rgba(20, 33, 61, 0.06),
            inset 0 1px 0
              rgba(255, 255, 255, 0.8);

          animation:
            termsHeroIn 0.7s
            cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .terms-hero::before {
          content: "";

          position: absolute;
          inset: 0;

          opacity: 0.28;

          pointer-events: none;

          background-image:
            linear-gradient(
              rgba(20, 33, 61, 0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(20, 33, 61, 0.035) 1px,
              transparent 1px
            );

          background-size: 30px 30px;

          mask-image:
            linear-gradient(
              to right,
              transparent,
              black 25%,
              black 75%,
              transparent
            );
        }

        .terms-hero-content {
          position: relative;
          z-index: 2;

          max-width: 660px;
        }

        .terms-status {
          display: inline-flex;
          align-items: center;
          gap: 9px;

          padding: 7px 12px;

          border: 1px solid
            rgba(169, 121, 31, 0.22);

          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.58);

          color: #8A6417;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 0.12em;
          text-transform: uppercase;

          backdrop-filter: blur(10px);
        }

        .terms-status-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: var(--gold);

          box-shadow:
            0 0 0 5px
              rgba(169, 121, 31, 0.10);

          animation:
            termsPulse 2.2s
            ease-in-out
            infinite;
        }

        .terms-hero-title {
          margin: 18px 0 0;

          color: var(--navy);

          font-size:
            clamp(28px, 5vw, 46px);

          line-height: 1.05;

          font-weight: 850;

          letter-spacing: -0.045em;
        }

        .terms-hero-description {
          max-width: 620px;

          margin: 16px 0 0;

          color: var(--muted);

          font-size: 15px;
          line-height: 1.75;
        }

        .terms-meta {
          display: flex;
          flex-wrap: wrap;

          gap: 9px;

          margin-top: 24px;
        }

        .terms-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          padding: 8px 11px;

          border: 1px solid
            rgba(20, 33, 61, 0.08);

          border-radius: 9px;

          background:
            rgba(255, 255, 255, 0.55);

          color: #526075;

          font-size: 11px;
          font-weight: 650;
        }

        .terms-meta-icon {
          color: var(--gold);

          font-size: 13px;
        }

        /* =========================================
           HERO DOCUMENT GRAPHIC
        ========================================= */

        .terms-visual {
          position: absolute;

          top: 50%;
          right: 7%;

          width: 210px;
          height: 210px;

          transform:
            translateY(-50%);

          pointer-events: none;
        }

        .terms-orbit {
          position: absolute;
          inset: 0;

          border:
            1px dashed
            rgba(169, 121, 31, 0.25);

          border-radius: 50%;

          animation:
            termsRotate 28s
            linear
            infinite;
        }

        .terms-orbit::before,
        .terms-orbit::after {
          content: "";

          position: absolute;

          width: 8px;
          height: 8px;

          border-radius: 50%;

          background:
            var(--gold);

          box-shadow:
            0 0 0 6px
              rgba(169, 121, 31, 0.09);
        }

        .terms-orbit::before {
          top: 13%;
          left: 16%;
        }

        .terms-orbit::after {
          right: 8%;
          bottom: 20%;
        }

        .terms-document {
          position: absolute;

          top: 50%;
          left: 50%;

          width: 112px;
          height: 142px;

          transform:
            translate(-50%, -50%)
            rotate(-5deg);

          border-radius: 11px;

          background:
            linear-gradient(
              145deg,
              #FFFFFF,
              #F1F2ED
            );

          border:
            1px solid
              rgba(20, 33, 61, 0.12);

          box-shadow:
            0 18px 35px
              rgba(20, 33, 61, 0.15);

          animation:
            termsDocumentFloat 4.5s
            ease-in-out
            infinite;
        }

        .terms-document::before {
          content: "";

          position: absolute;

          top: 18px;
          left: 16px;

          width: 43px;
          height: 5px;

          border-radius: 99px;

          background:
            var(--navy);
        }

        .terms-document::after {
          content: "";

          position: absolute;

          top: 37px;
          left: 16px;

          width: 72px;
          height: 3px;

          border-radius: 99px;

          background:
            rgba(20, 33, 61, 0.13);

          box-shadow:
            0 11px 0
              rgba(20, 33, 61, 0.09),
            0 22px 0
              rgba(20, 33, 61, 0.09),
            0 33px 0
              rgba(20, 33, 61, 0.09);
        }

        .terms-document-mark {
          position: absolute;

          left: 16px;
          bottom: 18px;

          width: 34px;
          height: 34px;

          border-radius: 9px;

          background:
            var(--navy);

          color:
            var(--gold-light);

          display: grid;
          place-items: center;

          font-size: 16px;
          font-weight: 900;

          box-shadow:
            0 7px 14px
              rgba(20, 33, 61, 0.14);
        }

        .terms-document-badge {
          position: absolute;

          right: -10px;
          bottom: 19px;

          display: grid;
          place-items: center;

          width: 42px;
          height: 42px;

          border-radius: 50%;

          background:
            var(--gold);

          color:
            white;

          font-size: 17px;
          font-weight: 900;

          border:
            4px solid
            #F5F5EF;

          box-shadow:
            0 8px 18px
              rgba(169, 121, 31, 0.25);

          animation:
            termsBadgePulse 2.7s
            ease-in-out
            infinite;
        }

        /* =========================================
           SUMMARY CARDS
        ========================================= */

        .terms-info-grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 13px;

          margin: 0 0 32px;
        }

        .terms-info-card {
          position: relative;

          overflow: hidden;

          padding: 18px;

          border: 1px solid
            rgba(20, 33, 61, 0.08);

          border-radius: 14px;

          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.78),
              rgba(238, 242, 237, 0.68)
            );

          box-shadow:
            0 8px 24px
              rgba(20, 33, 61, 0.04);

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .terms-info-card:hover {
          transform:
            translateY(-3px);

          border-color:
            rgba(169, 121, 31, 0.18);

          box-shadow:
            0 14px 32px
              rgba(20, 33, 61, 0.07);
        }

        .terms-info-card::after {
          content: "";

          position: absolute;

          width: 65px;
          height: 65px;

          right: -24px;
          bottom: -28px;

          border-radius: 50%;

          background:
            rgba(169, 121, 31, 0.07);
        }

        .terms-info-icon {
          display: grid;
          place-items: center;

          width: 34px;
          height: 34px;

          margin-bottom: 11px;

          border-radius: 9px;

          background:
            var(--navy);

          color:
            var(--gold-light);

          font-size: 14px;
          font-weight: 800;
        }

        .terms-info-card h3 {
          margin: 0;

          color:
            var(--navy);

          font-size: 13px;
          font-weight: 800;
        }

        .terms-info-card p {
          margin: 7px 0 0;

          color:
            #778091;

          font-size: 11px;
          line-height: 1.55;
        }

        /* =========================================
           CONTENT LAYOUT
        ========================================= */

        .terms-layout {
          position: relative;
        }

        .terms-navigation {
          position: sticky;

          top: 24px;

          z-index: 10;

          float: right;

          width: 220px;

          margin-left: 30px;
          margin-bottom: 24px;

          padding: 18px;

          border: 1px solid var(--border);

          border-radius: 16px;

          background:
            rgba(255, 255, 255, 0.74);

          box-shadow:
            0 12px 35px
              rgba(20, 33, 61, 0.06);

          backdrop-filter: blur(14px);
        }

        .terms-navigation-title {
          margin: 0 0 12px;

          color:
            var(--navy);

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .terms-navigation a {
          display: block;

          padding: 6px 8px;

          border-radius: 7px;

          color:
            #6A7484;

          font-size: 11px;
          line-height: 1.4;

          text-decoration: none;

          transition:
            color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }

        .terms-navigation a:hover {
          background:
            var(--cream-dark);

          color:
            var(--navy);

          transform:
            translateX(2px);
        }

        /* =========================================
           SECTIONS
        ========================================= */

        .terms-content {
          animation:
            termsContentIn 0.7s
            0.12s
            cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .terms-section {
          position: relative;

          margin: 0 0 30px;

          padding: 26px 27px;

          border:
            1px solid
            rgba(20, 33, 61, 0.075);

          border-radius: 17px;

          background:
            rgba(255, 255, 255, 0.56);

          box-shadow:
            0 7px 25px
              rgba(20, 33, 61, 0.035);

          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .terms-section:hover {
          transform:
            translateY(-2px);

          border-color:
            rgba(169, 121, 31, 0.16);

          box-shadow:
            0 13px 34px
              rgba(20, 33, 61, 0.065);
        }

        .terms-section h2 {
          position: relative;

          margin-top: 0;

          padding-left: 16px;

          color:
            var(--navy);
        }

        .terms-section h2::before {
          content: "";

          position: absolute;

          top: 4px;
          bottom: 4px;
          left: 0;

          width: 3px;

          border-radius: 999px;

          background:
            linear-gradient(
              to bottom,
              var(--gold),
              var(--gold-light)
            );
        }

        .terms-section p:last-child,
        .terms-section ul:last-child {
          margin-bottom: 0;
        }

        .terms-section strong {
          color:
            var(--navy);
        }

        .terms-section li::marker {
          color:
            var(--gold);
        }

        .terms-section a {
          color:
            #896519;

          font-weight: 650;

          text-decoration-color:
            rgba(169, 121, 31, 0.35);

          text-underline-offset: 3px;

          transition:
            color 0.2s ease,
            text-decoration-color 0.2s ease;
        }

        .terms-section a:hover {
          color:
            var(--navy);

          text-decoration-color:
            var(--navy);
        }

        /* =========================================
           USER RESPONSIBILITIES
        ========================================= */

        .terms-responsibility-grid {
          display: grid;

          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 10px;

          margin-top: 20px;
        }

        .terms-responsibility-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;

          padding: 12px;

          border:
            1px solid
            rgba(20, 33, 61, 0.07);

          border-radius: 10px;

          background:
            rgba(238, 242, 237, 0.58);
        }

        .terms-responsibility-check {
          display: grid;
          place-items: center;

          flex: 0 0 auto;

          width: 24px;
          height: 24px;

          border-radius: 7px;

          background:
            var(--navy);

          color:
            var(--gold-light);

          font-size: 10px;
          font-weight: 900;
        }

        .terms-responsibility-item span {
          color:
            #5F6B7C;

          font-size: 11px;
          line-height: 1.55;
        }

        /* =========================================
           CONTACT CARD
        ========================================= */

        .terms-contact {
          display: flex;
          align-items: center;
          gap: 16px;

          margin-top: 8px;

          padding: 20px 22px;

          border:
            1px solid
            rgba(20, 33, 61, 0.08);

          border-radius: 15px;

          background:
            linear-gradient(
              135deg,
              rgba(20, 33, 61, 0.04),
              rgba(169, 121, 31, 0.07)
            );
        }

        .terms-contact-icon {
          display: grid;
          place-items: center;

          flex: 0 0 auto;

          width: 42px;
          height: 42px;

          border-radius: 12px;

          background:
            var(--navy);

          color:
            var(--gold-light);

          font-size: 17px;

          box-shadow:
            0 8px 20px
              rgba(20, 33, 61, 0.12);
        }

        .terms-contact-label {
          margin: 0;

          color:
            #7A8494;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .terms-contact-email {
          display: inline-block;

          margin-top: 3px;

          color:
            var(--navy);

          font-size: 13px;
          font-weight: 750;

          text-decoration: none;
        }

        /* =========================================
           LEGAL NOTICE
        ========================================= */

        .terms-notice {
          position: relative;

          overflow: hidden;

          margin-top: 34px;

          padding:
            21px
            22px
            21px
            25px;

          border:
            1px solid
            rgba(169, 121, 31, 0.20);

          border-radius: 15px;

          background:
            linear-gradient(
              135deg,
              rgba(238, 242, 237, 0.92),
              rgba(247, 245, 238, 0.92)
            );

          box-shadow:
            0 10px 30px
              rgba(20, 33, 61, 0.045);
        }

        .terms-notice::before {
          content: "";

          position: absolute;

          top: 0;
          bottom: 0;
          left: 0;

          width: 4px;

          background:
            linear-gradient(
              to bottom,
              var(--gold),
              var(--gold-light)
            );
        }

        .terms-notice-title {
          display: flex;
          align-items: center;
          gap: 9px;

          margin-bottom: 6px;

          color:
            var(--navy);

          font-size: 12px;
          font-weight: 800;
        }

        .terms-notice-icon {
          display: grid;
          place-items: center;

          width: 23px;
          height: 23px;

          border-radius: 7px;

          background:
            var(--navy);

          color:
            var(--gold-light);

          font-size: 11px;
        }

        .terms-notice p {
          margin: 0;

          color:
            #687386;

          font-size: 11px;
          line-height: 1.7;
        }

        /* =========================================
           FOOTER
        ========================================= */

        .terms-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          gap: 20px;

          margin-top: 38px;
          padding-top: 22px;

          border-top:
            1px solid
            rgba(20, 33, 61, 0.08);
        }

        .terms-footer-brand {
          color:
            var(--navy);

          font-size: 12px;
          font-weight: 800;
        }

        .terms-footer-text {
          color:
            #8A93A1;

          font-size: 10px;
        }

        /* =========================================
           ANIMATIONS
        ========================================= */

        @keyframes termsHeroIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes termsContentIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes termsPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }

          50% {
            transform: scale(0.72);
            opacity: 0.55;
          }
        }

        @keyframes termsRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes termsDocumentFloat {
          0%,
          100% {
            transform:
              translate(-50%, -50%)
              rotate(-5deg)
              translateY(0);
          }

          50% {
            transform:
              translate(-50%, -50%)
              rotate(-2deg)
              translateY(-9px);
          }
        }

        @keyframes termsBadgePulse {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.08);
          }
        }

        /* =========================================
           RESPONSIVE
        ========================================= */

        @media (max-width: 900px) {
          .terms-visual {
            right: 3%;
            opacity: 0.5;
          }

          .terms-navigation {
            display: none;
          }

          .terms-info-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .terms-hero {
            padding: 28px 22px;
            border-radius: 18px;
          }

          .terms-visual {
            width: 135px;
            height: 135px;

            right: -5px;
            top: 22px;

            transform: none;

            opacity: 0.22;
          }

          .terms-document {
            width: 82px;
            height: 104px;
          }

          .terms-document::before {
            top: 13px;
            left: 12px;

            width: 32px;
            height: 4px;
          }

          .terms-document::after {
            top: 29px;
            left: 12px;

            width: 53px;
            height: 2px;

            box-shadow:
              0 8px 0
                rgba(20, 33, 61, 0.09),
              0 16px 0
                rgba(20, 33, 61, 0.09),
              0 24px 0
                rgba(20, 33, 61, 0.09);
          }

          .terms-document-mark {
            left: 12px;
            bottom: 13px;

            width: 27px;
            height: 27px;

            border-radius: 7px;

            font-size: 13px;
          }

          .terms-document-badge {
            right: -8px;
            bottom: 12px;

            width: 34px;
            height: 34px;

            font-size: 14px;

            border-width: 3px;
          }

          .terms-meta {
            display: grid;
            grid-template-columns: 1fr;
          }

          .terms-info-grid {
            grid-template-columns: 1fr;
          }

          .terms-section {
            padding: 21px 19px;
            border-radius: 14px;
          }

          .terms-responsibility-grid {
            grid-template-columns: 1fr;
          }

          .terms-contact {
            align-items: flex-start;
          }

          .terms-footer {
            align-items: flex-start;
            flex-direction: column;
            gap: 7px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .terms-page *,
          .terms-page *::before,
          .terms-page *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* =========================================
          HERO
      ========================================= */}

      <section className="terms-hero">
        <div className="terms-hero-content">
          <div className="terms-status">
            <span className="terms-status-dot" />
            Platform Terms
          </div>

          <h2 className="terms-hero-title">
            Clear rules for a
            <br />
            better learning platform.
          </h2>

          <p className="terms-hero-description">
            These Terms of Use govern access to and use of the
            Accqudo website and online exam-practice services.
            By creating an account or using Accqudo, you agree
            to comply with these Terms and applicable law.
          </p>

          <div className="terms-meta">
            <div className="terms-meta-item">
              <span className="terms-meta-icon">
                ✓
              </span>
              Platform use
            </div>

            <div className="terms-meta-item">
              <span className="terms-meta-icon">
                ✓
              </span>
              User responsibilities
            </div>

            <div className="terms-meta-item">
              <span className="terms-meta-icon">
                ✓
              </span>
              Content rights
            </div>
          </div>
        </div>

        {/* Animated document graphic */}

        <div
          className="terms-visual"
          aria-hidden="true"
        >
          <div className="terms-orbit" />

          <div className="terms-document">
            <div className="terms-document-mark">
              A
            </div>

            <div className="terms-document-badge">
              ✓
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}

      <div className="terms-info-grid">
        <div className="terms-info-card">
          <div className="terms-info-icon">
            01
          </div>

          <h3>Use Accqudo responsibly</h3>

          <p>
            Keep your account secure and use the platform for
            lawful educational and preparation purposes.
          </p>
        </div>

        <div className="terms-info-card">
          <div className="terms-info-icon">
            02
          </div>

          <h3>Respect platform content</h3>

          <p>
            Accqudo content, software, designs and original
            materials remain protected by applicable rights.
          </p>
        </div>

        <div className="terms-info-card">
          <div className="terms-info-icon">
            03
          </div>

          <h3>Know the limitations</h3>

          <p>
            Accqudo supports preparation and practice but does
            not guarantee external examination results.
          </p>
        </div>
      </div>

      {/* =========================================
          CONTENT + NAVIGATION
      ========================================= */}

      <div className="terms-layout">
        <aside className="terms-navigation">
          <p className="terms-navigation-title">
            On this page
          </p>

          <a href="#about">
            1. About Accqudo
          </a>

          <a href="#eligibility">
            2. Eligibility & accounts
          </a>

          <a href="#educational">
            3. Educational use
          </a>

          <a href="#responsibilities">
            4. User responsibilities
          </a>

          <a href="#intellectual-property">
            5. Intellectual property
          </a>

          <a href="#third-party">
            6. Third-party services
          </a>

          <a href="#availability">
            7. Availability & changes
          </a>

          <a href="#payments">
            8. Payments & refunds
          </a>

          <a href="#termination">
            9. Suspension & termination
          </a>

          <a href="#accuracy">
            10. Accuracy of content
          </a>

          <a href="#authority">
            11. Examination disclaimer
          </a>

          <a href="#contact">
            12. Contact
          </a>
        </aside>

        <div className="terms-content">
          {/* =====================================
              1
          ===================================== */}

          <section
            id="about"
            className="terms-section"
          >
            <h2>1. About Accqudo</h2>

            <p>
              Accqudo is an independent online educational
              test-preparation platform. It provides structured
              practice through test series,
              chapter/topic/subject tests, mock tests, attempts,
              results and performance-related features.
            </p>

            <p>
              Accqudo is not affiliated with or endorsed by an
              examination authority unless a specific
              affiliation is expressly stated on the relevant
              Accqudo page or communication.
            </p>
          </section>

          {/* =====================================
              2
          ===================================== */}

          <section
            id="eligibility"
            className="terms-section"
          >
            <h2>2. Eligibility and accounts</h2>

            <p>
              You must provide accurate information when
              creating an account and keep your login credentials
              secure.
            </p>

            <p>
              You are responsible for activity performed through
              your account, except where applicable law provides
              otherwise.
            </p>

            <p>
              If you are a minor, use of Accqudo may be subject
              to applicable parental or guardian consent
              requirements.
            </p>
          </section>

          {/* =====================================
              3
          ===================================== */}

          <section
            id="educational"
            className="terms-section"
          >
            <h2>3. Educational use</h2>

            <p>
              Accqudo is a practice and preparation service.
              Test scores, rankings, analytics and performance
              indicators are intended to help users practise and
              evaluate their progress.
            </p>

            <p>
              They do not guarantee admission, selection, rank,
              percentile or any result in an external
              examination.
            </p>
          </section>

          {/* =====================================
              4
          ===================================== */}

          <section
            id="responsibilities"
            className="terms-section"
          >
            <h2>4. User responsibilities</h2>

            <p>
              You agree not to engage in the following
              activities:
            </p>

            <div className="terms-responsibility-grid">
              <div className="terms-responsibility-item">
                <div className="terms-responsibility-check">
                  ✓
                </div>

                <span>
                  Share or sell your account or paid access.
                </span>
              </div>

              <div className="terms-responsibility-item">
                <div className="terms-responsibility-check">
                  ✓
                </div>

                <span>
                  Copy, reproduce, publish, resell or
                  commercially exploit Accqudo content without
                  permission.
                </span>
              </div>

              <div className="terms-responsibility-item">
                <div className="terms-responsibility-check">
                  ✓
                </div>

                <span>
                  Scrape or bulk-extract questions, answers,
                  explanations or other protected content.
                </span>
              </div>

              <div className="terms-responsibility-item">
                <div className="terms-responsibility-check">
                  ✓
                </div>

                <span>
                  Attempt to bypass access controls, payment
                  controls or security measures.
                </span>
              </div>

              <div className="terms-responsibility-item">
                <div className="terms-responsibility-check">
                  ✓
                </div>

                <span>
                  Introduce malicious code or interfere with
                  the platform.
                </span>
              </div>

              <div className="terms-responsibility-item">
                <div className="terms-responsibility-check">
                  ✓
                </div>

                <span>
                  Submit fraudulent payment information or
                  misuse refunds.
                </span>
              </div>

              <div className="terms-responsibility-item">
                <div className="terms-responsibility-check">
                  ✓
                </div>

                <span>
                  Manipulate leaderboards, results or other
                  platform data.
                </span>
              </div>

              <div className="terms-responsibility-item">
                <div className="terms-responsibility-check">
                  ✓
                </div>

                <span>
                  Use the platform for an unlawful purpose.
                </span>
              </div>
            </div>
          </section>

          {/* =====================================
              5
          ===================================== */}

          <section
            id="intellectual-property"
            className="terms-section"
          >
            <h2>5. Intellectual property</h2>

            <p>
              The Accqudo brand, software, interface, design,
              database structure, original question content,
              explanations, graphics and other Accqudo-owned
              materials are protected by applicable
              intellectual-property laws.
            </p>

            <p>
              Your subscription or account gives you a limited
              right to use the service; it does not transfer
              ownership of Accqudo content.
            </p>
          </section>

          {/* =====================================
              6
          ===================================== */}

          <section
            id="third-party"
            className="terms-section"
          >
            <h2>6. Third-party services</h2>

            <p>
              Some parts of Accqudo may depend on third-party
              services such as payment, hosting,
              authentication, email or analytics providers.
            </p>

            <p>
              Those services may have their own terms and
              privacy policies.
            </p>
          </section>

          {/* =====================================
              7
          ===================================== */}

          <section
            id="availability"
            className="terms-section"
          >
            <h2>7. Availability and changes</h2>

            <p>
              Accqudo may add, remove or modify tests, packages,
              features and content.
            </p>

            <p>
              We aim to keep the service available and accurate,
              but online services can experience outages,
              maintenance, errors or interruptions.
            </p>
          </section>

          {/* =====================================
              8
          ===================================== */}

          <section
            id="payments"
            className="terms-section"
          >
            <h2>
              8. Payments, subscriptions and refunds
            </h2>

            <p>
              Paid access is governed by the plan and pricing
              displayed at the time of purchase.
            </p>

            <p>
              Additional rules concerning access duration,
              cancellation, renewal and refunds are set out in
              the Subscription Terms and Refund Policy.
            </p>
          </section>

          {/* =====================================
              9
          ===================================== */}

          <section
            id="termination"
            className="terms-section"
          >
            <h2>
              9. Suspension or termination
            </h2>

            <p>
              Accqudo may restrict or suspend access where
              reasonably necessary to protect the service,
              investigate abuse, address security risks,
              enforce these Terms or comply with law.
            </p>

            <p>
              Where appropriate, users will be given an
              opportunity to contact support.
            </p>
          </section>

          {/* =====================================
              10
          ===================================== */}

          <section
            id="accuracy"
            className="terms-section"
          >
            <h2>10. Accuracy of content</h2>

            <p>
              Accqudo works to provide useful and accurate
              educational content. However, educational content
              may contain errors or become outdated.
            </p>

            <p>
              If you identify an incorrect question, answer or
              explanation, please report it to{" "}
              <a href="mailto:accqudo@gmail.com">
                accqudo@gmail.com
              </a>
              .
            </p>
          </section>

          {/* =====================================
              11
          ===================================== */}

          <section
            id="authority"
            className="terms-section"
          >
            <h2>
              11. Examination authority disclaimer
            </h2>

            <p>
              References to examinations, examination names or
              related preparation categories are for
              identification and preparation purposes.
            </p>

            <p>
              Unless expressly stated, Accqudo does not
              represent that it is affiliated with, sponsored by
              or endorsed by the relevant examination authority.
            </p>
          </section>

          {/* =====================================
              12
          ===================================== */}

          <section
            id="contact"
            className="terms-section"
          >
            <h2>12. Contact</h2>

            <p>
              For support or questions about these Terms,
              contact:
            </p>

            <div className="terms-contact">
              <div className="terms-contact-icon">
                @
              </div>

              <div>
                <p className="terms-contact-label">
                  Accqudo support
                </p>

                <a
                  href="mailto:accqudo@gmail.com"
                  className="terms-contact-email"
                >
                  accqudo@gmail.com
                </a>
              </div>
            </div>
          </section>

          {/* =====================================
              LEGAL NOTICE
          ===================================== */}

          <div className="terms-notice">
            <div className="terms-notice-title">
              <span className="terms-notice-icon">
                !
              </span>

              Important legal review note
            </div>

            <p>
              These Terms should be reviewed and finalized by
              qualified Indian legal counsel before they are
              treated as the definitive contractual terms for
              paid users.
            </p>
          </div>

          {/* =====================================
              FOOTER
          ===================================== */}

          <div className="terms-footer">
            <div className="terms-footer-brand">
              Accqudo
            </div>

            <div className="terms-footer-text">
              Clear rules · Responsible learning ·
              Better preparation
            </div>
          </div>
        </div>
      </div>
    </InfoShell>
  );
}