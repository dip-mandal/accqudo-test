import { InfoShell } from "../_components/InfoShell";

export const metadata = {
  title: "Privacy Policy | Accqudo",
  description:
    "Accqudo Privacy Policy covering personal data, accounts, test attempts, analytics, payments and user rights.",
};

export default function PrivacyPolicyPage() {
  return (
    <InfoShell title="Privacy Policy" eyebrow="Accqudo · Privacy">
      <style>{`
        .privacy-page {
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

        /* -----------------------------------------
           HERO
        ----------------------------------------- */

        .privacy-hero {
          position: relative;
          overflow: hidden;
          margin-bottom: 42px;
          padding: 42px 34px;
          border: 1px solid rgba(20, 33, 61, 0.08);
          border-radius: 24px;
          background:
            radial-gradient(
              circle at 85% 15%,
              rgba(213, 180, 90, 0.18),
              transparent 28%
            ),
            radial-gradient(
              circle at 15% 90%,
              rgba(20, 33, 61, 0.08),
              transparent 32%
            ),
            linear-gradient(
              135deg,
              #f9f8f3 0%,
              #eef2ed 100%
            );
          box-shadow:
            0 18px 50px rgba(20, 33, 61, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);
          animation: privacyHeroIn 0.7s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .privacy-hero::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.3;
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
          mask-image: linear-gradient(
            to right,
            transparent,
            black 25%,
            black 75%,
            transparent
          );
        }

        .privacy-hero-content {
          position: relative;
          z-index: 2;
          max-width: 680px;
        }

        .privacy-status {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 7px 12px;
          border: 1px solid rgba(169, 121, 31, 0.22);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.55);
          color: #8A6417;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
        }

        .privacy-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow:
            0 0 0 5px rgba(169, 121, 31, 0.10);
          animation: privacyPulse 2.2s ease-in-out infinite;
        }

        .privacy-hero-title {
          margin: 18px 0 0;
          color: var(--navy);
          font-size: clamp(28px, 5vw, 46px);
          line-height: 1.05;
          font-weight: 850;
          letter-spacing: -0.045em;
        }

        .privacy-hero-description {
          max-width: 620px;
          margin: 16px 0 0;
          color: var(--muted);
          font-size: 15px;
          line-height: 1.75;
        }

        .privacy-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 24px;
        }

        .privacy-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 11px;
          border: 1px solid rgba(20, 33, 61, 0.08);
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.55);
          color: #526075;
          font-size: 11px;
          font-weight: 650;
        }

        .privacy-meta-icon {
          color: var(--gold);
          font-size: 13px;
        }

        /* -----------------------------------------
           HERO GRAPHIC
        ----------------------------------------- */

        .privacy-visual {
          position: absolute;
          top: 50%;
          right: 7%;
          width: 190px;
          height: 190px;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .privacy-orbit {
          position: absolute;
          inset: 0;
          border: 1px dashed rgba(169, 121, 31, 0.25);
          border-radius: 50%;
          animation: privacyRotate 24s linear infinite;
        }

        .privacy-orbit::before,
        .privacy-orbit::after {
          content: "";
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow:
            0 0 0 6px rgba(169, 121, 31, 0.09);
        }

        .privacy-orbit::before {
          top: 15%;
          left: 16%;
        }

        .privacy-orbit::after {
          right: 8%;
          bottom: 20%;
        }

        .privacy-shield {
          position: absolute;
          top: 50%;
          left: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 86px;
          height: 102px;
          transform: translate(-50%, -50%);
          color: var(--gold);
          filter: drop-shadow(
            0 15px 18px rgba(20, 33, 61, 0.10)
          );
          animation: shieldFloat 4s ease-in-out infinite;
        }

        .privacy-shield svg {
          width: 86px;
          height: 102px;
        }

        .privacy-lock {
          position: absolute;
          top: 50%;
          left: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 31px;
          height: 31px;
          transform: translate(-50%, -38%);
          border-radius: 9px;
          background: var(--navy);
          color: white;
          box-shadow:
            0 7px 16px rgba(20, 33, 61, 0.20);
          font-size: 14px;
        }

        /* -----------------------------------------
           QUICK NAV
        ----------------------------------------- */

        .privacy-layout {
          position: relative;
        }

        .privacy-navigation {
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
          background: rgba(255, 255, 255, 0.74);
          box-shadow:
            0 12px 35px rgba(20, 33, 61, 0.06);
          backdrop-filter: blur(14px);
        }

        .privacy-navigation-title {
          margin: 0 0 12px;
          color: var(--navy);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .privacy-navigation a {
          display: block;
          padding: 6px 8px;
          border-radius: 7px;
          color: #6A7484;
          font-size: 11px;
          line-height: 1.4;
          text-decoration: none;
          transition:
            color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }

        .privacy-navigation a:hover {
          background: var(--cream-dark);
          color: var(--navy);
          transform: translateX(2px);
        }

        /* -----------------------------------------
           CONTENT
        ----------------------------------------- */

        .privacy-content {
          animation: privacyContentIn 0.7s
            0.12s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .privacy-section {
          position: relative;
          margin: 0 0 30px;
          padding: 26px 27px;
          border: 1px solid rgba(20, 33, 61, 0.075);
          border-radius: 17px;
          background: rgba(255, 255, 255, 0.56);
          box-shadow:
            0 7px 25px rgba(20, 33, 61, 0.035);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }

        .privacy-section:hover {
          transform: translateY(-2px);
          border-color: rgba(169, 121, 31, 0.16);
          box-shadow:
            0 13px 34px rgba(20, 33, 61, 0.065);
        }

        .privacy-section h2 {
          position: relative;
          margin-top: 0;
          padding-left: 16px;
          color: var(--navy);
        }

        .privacy-section h2::before {
          content: "";
          position: absolute;
          top: 4px;
          bottom: 4px;
          left: 0;
          width: 3px;
          border-radius: 999px;
          background: linear-gradient(
            to bottom,
            var(--gold),
            var(--gold-light)
          );
        }

        .privacy-section p:last-child,
        .privacy-section ul:last-child {
          margin-bottom: 0;
        }

        .privacy-section li::marker {
          color: var(--gold);
        }

        .privacy-section strong {
          color: var(--navy);
        }

        .privacy-section a {
          color: #896519;
          font-weight: 650;
          text-decoration-color: rgba(169, 121, 31, 0.35);
          text-underline-offset: 3px;
          transition:
            color 0.2s ease,
            text-decoration-color 0.2s ease;
        }

        .privacy-section a:hover {
          color: var(--navy);
          text-decoration-color: var(--navy);
        }

        /* -----------------------------------------
           INFORMATION CARDS
        ----------------------------------------- */

        .privacy-info-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 13px;
          margin: 0 0 32px;
        }

        .privacy-info-card {
          position: relative;
          overflow: hidden;
          padding: 18px;
          border: 1px solid rgba(20, 33, 61, 0.08);
          border-radius: 14px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.78),
              rgba(238, 242, 237, 0.68)
            );
          box-shadow:
            0 8px 24px rgba(20, 33, 61, 0.04);
        }

        .privacy-info-card::after {
          content: "";
          position: absolute;
          width: 65px;
          height: 65px;
          right: -24px;
          bottom: -28px;
          border-radius: 50%;
          background: rgba(169, 121, 31, 0.07);
        }

        .privacy-info-icon {
          display: grid;
          place-items: center;
          width: 34px;
          height: 34px;
          margin-bottom: 11px;
          border-radius: 9px;
          background: var(--navy);
          color: var(--gold-light);
          font-size: 15px;
        }

        .privacy-info-card h3 {
          margin: 0;
          color: var(--navy);
          font-size: 13px;
          font-weight: 800;
        }

        .privacy-info-card p {
          margin: 7px 0 0;
          color: #778091;
          font-size: 11px;
          line-height: 1.55;
        }

        /* -----------------------------------------
           NOTICE
        ----------------------------------------- */

        .privacy-notice {
          position: relative;
          overflow: hidden;
          margin-top: 34px;
          padding: 21px 22px 21px 25px;
          border: 1px solid rgba(169, 121, 31, 0.20);
          border-radius: 15px;
          background:
            linear-gradient(
              135deg,
              rgba(238, 242, 237, 0.92),
              rgba(247, 245, 238, 0.92)
            );
          box-shadow:
            0 10px 30px rgba(20, 33, 61, 0.045);
        }

        .privacy-notice::before {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 4px;
          background: linear-gradient(
            to bottom,
            var(--gold),
            var(--gold-light)
          );
        }

        .privacy-notice-title {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 6px;
          color: var(--navy);
          font-size: 12px;
          font-weight: 800;
        }

        .privacy-notice-icon {
          display: grid;
          place-items: center;
          width: 23px;
          height: 23px;
          border-radius: 7px;
          background: var(--navy);
          color: var(--gold-light);
          font-size: 11px;
        }

        .privacy-notice p {
          margin: 0;
          color: #687386;
          font-size: 11px;
          line-height: 1.7;
        }

        /* -----------------------------------------
           FOOTER
        ----------------------------------------- */

        .privacy-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 38px;
          padding-top: 22px;
          border-top: 1px solid rgba(20, 33, 61, 0.08);
        }

        .privacy-footer-brand {
          color: var(--navy);
          font-size: 12px;
          font-weight: 800;
        }

        .privacy-footer-text {
          color: #8A93A1;
          font-size: 10px;
        }

        /* -----------------------------------------
           ANIMATIONS
        ----------------------------------------- */

        @keyframes privacyHeroIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes privacyContentIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes privacyPulse {
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

        @keyframes privacyRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes shieldFloat {
          0%,
          100% {
            transform: translate(-50%, -50%) translateY(0);
          }

          50% {
            transform: translate(-50%, -50%) translateY(-8px);
          }
        }

        /* -----------------------------------------
           RESPONSIVE
        ----------------------------------------- */

        @media (max-width: 900px) {
          .privacy-visual {
            right: 3%;
            opacity: 0.55;
          }

          .privacy-navigation {
            display: none;
          }

          .privacy-info-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .privacy-hero {
            padding: 28px 22px;
            border-radius: 18px;
          }

          .privacy-visual {
            width: 130px;
            height: 130px;
            right: -5px;
            top: 25px;
            transform: none;
            opacity: 0.24;
          }

          .privacy-shield,
          .privacy-shield svg {
            width: 62px;
            height: 74px;
          }

          .privacy-lock {
            width: 25px;
            height: 25px;
            font-size: 11px;
          }

          .privacy-meta {
            display: grid;
            grid-template-columns: 1fr;
          }

          .privacy-info-grid {
            grid-template-columns: 1fr;
          }

          .privacy-section {
            padding: 21px 19px;
            border-radius: 14px;
          }

          .privacy-footer {
            align-items: flex-start;
            flex-direction: column;
            gap: 7px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .privacy-page *,
          .privacy-page *::before,
          .privacy-page *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* =========================================
          HERO
      ========================================= */}

      <section className="privacy-hero">
        
        <div className="privacy-hero-content">
          <div className="privacy-status">
            <span className="privacy-status-dot" />
            Privacy & Data Protection
          </div>

          <h2 className="privacy-hero-title">
            Your data deserves
            <br />
            thoughtful protection.
          </h2>

          <p className="privacy-hero-description">
            This Privacy Policy explains how Accqudo handles information
            when you visit or use the Accqudo website and its
            exam-practice services.
          </p>

          <div className="privacy-meta">
            <div className="privacy-meta-item">
              <span className="privacy-meta-icon">✓</span>
              Account information
            </div>

            <div className="privacy-meta-item">
              <span className="privacy-meta-icon">✓</span>
              Test performance
            </div>

            <div className="privacy-meta-item">
              <span className="privacy-meta-icon">✓</span>
              Payments & security
            </div>
          </div>
        </div>

        <div className="privacy-visual" aria-hidden="true">
          <div className="privacy-orbit" />

          <div className="privacy-shield">
            <svg
              viewBox="0 0 100 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M50 6L88 20V52C88 78 72 101 50 114C28 101 12 78 12 52V20L50 6Z"
                fill="rgba(169,121,31,0.08)"
                stroke="currentColor"
                strokeWidth="3"
              />

              <path
                d="M50 17L77 27V51C77 70 66 88 50 98C34 88 23 70 23 51V27L50 17Z"
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.55"
              />
            </svg>

            <div className="privacy-lock">✓</div>
          </div>
        </div>
      </section>

      {/* =========================================
          QUICK INFORMATION
      ========================================= */}

      <div className="privacy-info-grid">
        <div className="privacy-info-card">
          <div className="privacy-info-icon">01</div>

          <h3>What we collect</h3>

          <p>
            Account, academic, transaction, technical and
            support-related information.
          </p>
        </div>

        <div className="privacy-info-card">
          <div className="privacy-info-icon">02</div>

          <h3>Why we use it</h3>

          <p>
            To provide tests, maintain accounts, improve
            reliability and protect the platform.
          </p>
        </div>

        <div className="privacy-info-card">
          <div className="privacy-info-icon">03</div>

          <h3>Your requests</h3>

          <p>
            Contact Accqudo regarding applicable access,
            correction and deletion requests.
          </p>
        </div>
      </div>

      {/* =========================================
          CONTENT + NAVIGATION
      ========================================= */}

      <div className="privacy-layout">
        <aside className="privacy-navigation">
          <p className="privacy-navigation-title">
            On this page
          </p>

          <a href="#information">1. Information we may collect</a>
          <a href="#use">2. How we use information</a>
          <a href="#attempts">3. Test attempts</a>
          <a href="#payments">4. Payments</a>
          <a href="#cookies">5. Cookies</a>
          <a href="#security">6. Data security</a>
          <a href="#retention">7. Data retention</a>
          <a href="#deletion">8. Account deletion</a>
          <a href="#children">9. Children</a>
          <a href="#third-party">10. Third-party links</a>
          <a href="#changes">11. Changes</a>
          <a href="#contact">12. Contact</a>
        </aside>

        <div className="privacy-content">
          {/* 1 */}

          <section
            id="information"
            className="privacy-section"
          >
            <h2>1. Information we may collect</h2>

            <p>
              This Privacy Policy explains how Accqudo handles
              information when you visit or use the Accqudo
              website and its exam-practice services. Accqudo
              provides online test series, mock tests,
              topic/chapter/subject practice, test attempts and
              performance information.
            </p>

            <p>
              Depending on how you use the platform, Accqudo may
              process:
            </p>

            <ul>
              <li>
                <strong>Account information:</strong> name,
                email address, mobile number and
                authentication-related information.
              </li>

              <li>
                <strong>Academic and usage information:</strong>{" "}
                selected exams, packages, tests attempted,
                answers submitted, scores, time/attempt
                information and performance history.
              </li>

              <li>
                <strong>Transaction information:</strong>{" "}
                subscription/package, payment status,
                order/reference information and refund
                information. Payment-card credentials should be
                handled by the payment provider rather than
                stored directly by Accqudo.
              </li>

              <li>
                <strong>Technical information:</strong> IP
                address, browser/device information, security
                logs and information needed to keep the service
                secure and functional.
              </li>

              <li>
                <strong>Support information:</strong>{" "}
                information you choose to provide when
                contacting Accqudo.
              </li>
            </ul>
          </section>

          {/* 2 */}

          <section id="use" className="privacy-section">
            <h2>2. How we use information</h2>

            <ul>
              <li>Create and maintain your account.</li>

              <li>
                Provide test-series, mock-test and assessment
                functionality.
              </li>

              <li>
                Record attempts and generate scores and
                performance analysis.
              </li>

              <li>
                Provide purchased access and manage
                subscriptions/packages.
              </li>

              <li>
                Process or reconcile payments, refunds and
                related support requests.
              </li>

              <li>
                Prevent fraud, abuse, unauthorized access and
                attacks on the platform.
              </li>

              <li>
                Diagnose errors, improve reliability and
                improve the user experience.
              </li>

              <li>
                Communicate with you about your account,
                transactions, support requests and important
                service changes.
              </li>
            </ul>
          </section>

          {/* 3 */}

          <section id="attempts" className="privacy-section">
            <h2>3. Test attempts and performance data</h2>

            <p>
              Test responses, scores, attempts and related
              performance information may be stored as part of
              the service. This information is used to provide
              results, attempt history, progress information and
              related features.
            </p>

            <p>
              We do not treat a test score as a guarantee of
              admission, rank or success in any external
              examination.
            </p>
          </section>

          {/* 4 */}

          <section id="payments" className="privacy-section">
            <h2>4. Payments and service providers</h2>

            <p>
              Accqudo may use third-party providers for payment
              processing, authentication, hosting, email,
              analytics, security and other infrastructure.
              Information shared with a provider is limited to
              what is reasonably necessary for the relevant
              service and subject to the applicable contractual
              and legal requirements.
            </p>
          </section>

          {/* 5 */}

          <section id="cookies" className="privacy-section">
            <h2>5. Cookies and analytics</h2>

            <p>
              Accqudo may use cookies, local storage and similar
              technologies for authentication, preferences,
              security and analytics. Browser storage may also
              be used for session or account-related
              functionality.
            </p>

            <p>
              Where consent is required by applicable law, the
              relevant consent mechanism will be provided.
            </p>
          </section>

          {/* 6 */}

          <section id="security" className="privacy-section">
            <h2>6. Data security</h2>

            <p>
              Accqudo uses reasonable technical and
              organisational measures appropriate to the
              service, including access controls, secure
              authentication practices, encrypted connections
              and operational monitoring.
            </p>

            <p>
              No internet service can guarantee absolute
              security.
            </p>
          </section>

          {/* 7 */}

          <section id="retention" className="privacy-section">
            <h2>7. Data retention</h2>

            <p>
              Personal data is retained for as long as
              reasonably necessary for the purposes for which it
              was collected, including providing the service,
              maintaining account and transaction records,
              security, dispute handling and complying with
              legal obligations.
            </p>

            <p>
              Retention periods may differ by data type.
            </p>
          </section>

          {/* 8 */}

          <section id="deletion" className="privacy-section">
            <h2>8. Account deletion and requests</h2>

            <p>
              You may contact Accqudo at{" "}
              <a href="mailto:accqudo@gmail.com">
                accqudo@gmail.com
              </a>{" "}
              for account-related privacy requests, including
              requests concerning access, correction, deletion
              or other rights available under applicable law.
            </p>

            <p>
              Some information may need to be retained where
              required by law or reasonably necessary for
              security, fraud prevention or dispute resolution.
            </p>
          </section>

          {/* 9 */}

          <section id="children" className="privacy-section">
            <h2>9. Children and minors</h2>

            <p>
              Accqudo may be used by students preparing for
              examinations, including students who may be below
              18. Where applicable law requires verifiable
              parental or guardian consent for processing a
              child&apos;s personal data, Accqudo will use the
              required consent mechanism.
            </p>

            <p>
              We do not intentionally ask students to provide
              unnecessary sensitive information.
            </p>

            <p>
              Parents or guardians who have questions about a
              child&apos;s data may contact{" "}
              <a href="mailto:accqudo@gmail.com">
                accqudo@gmail.com
              </a>
              .
            </p>
          </section>

          {/* 10 */}

          <section id="third-party" className="privacy-section">
            <h2>10. Third-party links</h2>

            <p>
              Accqudo may link to third-party services. Their
              privacy practices are governed by their own
              policies.
            </p>

            <p>
              Review those policies before providing
              information to a third party.
            </p>
          </section>

          {/* 11 */}

          <section id="changes" className="privacy-section">
            <h2>11. Changes to this policy</h2>

            <p>
              Accqudo may update this Privacy Policy when the
              service, technology or applicable legal
              requirements change.
            </p>

            <p>
              The updated version will be published on this page
              with a revised update date.
            </p>
          </section>

          {/* 12 */}

          <section id="contact" className="privacy-section">
            <h2>12. Contact</h2>

            <p>
              Privacy questions and requests can be sent to{" "}
              <a href="mailto:accqudo@gmail.com">
                accqudo@gmail.com
              </a>
              .
            </p>
          </section>

          {/* Legal review notice */}

          <div className="privacy-notice">
            <div className="privacy-notice-title">
              <span className="privacy-notice-icon">!</span>
              Important legal review note
            </div>

            <p>
              This policy is written for the current Accqudo
              product information available to us and should be
              reviewed by qualified Indian privacy counsel before
              production publication, particularly for
              child-data, consent, retention, breach-response
              and DPDP compliance.
            </p>
          </div>

          {/* Footer */}

          <div className="privacy-footer">
            <div className="privacy-footer-brand">
              Accqudo
            </div>

            <div className="privacy-footer-text">
              Privacy · Security · Responsible learning
            </div>
          </div>
        </div>
      </div>
    </InfoShell>
  );
}