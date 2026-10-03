import { InfoShell } from "../_components/InfoShell";

export const metadata = {
  title: "Subscription Terms | Accqudo",
  description:
    "Accqudo terms for paid test-series and subscription access.",
};

export default function SubscriptionTermsPage() {
  return (
    <InfoShell
      title="Subscription Terms"
      eyebrow="Accqudo · Paid Access"
    >
      <style>{`
        .subscription-page {
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

        .subscription-hero {
          position: relative;
          overflow: hidden;

          margin-bottom: 42px;
          padding: 42px 34px;

          border: 1px solid
            rgba(20, 33, 61, 0.08);

          border-radius: 24px;

          background:
            radial-gradient(
              circle at 86% 14%,
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
            subscriptionHeroIn 0.7s
            cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .subscription-hero::before {
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

        .subscription-hero-content {
          position: relative;
          z-index: 2;

          max-width: 660px;
        }

        .subscription-status {
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

        .subscription-status-dot {
          width: 7px;
          height: 7px;

          border-radius: 50%;

          background: var(--gold);

          box-shadow:
            0 0 0 5px
              rgba(169, 121, 31, 0.10);

          animation:
            subscriptionPulse 2.2s
            ease-in-out
            infinite;
        }

        .subscription-hero-title {
          margin: 18px 0 0;

          color: var(--navy);

          font-size:
            clamp(28px, 5vw, 46px);

          line-height: 1.05;

          font-weight: 850;

          letter-spacing: -0.045em;
        }

        .subscription-hero-description {
          max-width: 620px;

          margin: 16px 0 0;

          color: var(--muted);

          font-size: 15px;
          line-height: 1.75;
        }

        .subscription-meta {
          display: flex;
          flex-wrap: wrap;

          gap: 9px;

          margin-top: 24px;
        }

        .subscription-meta-item {
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

        .subscription-meta-icon {
          color: var(--gold);

          font-size: 13px;
        }

        /* =========================================
           SUBSCRIPTION VISUAL
        ========================================= */

        .subscription-visual {
          position: absolute;

          top: 50%;
          right: 6%;

          width: 215px;
          height: 215px;

          transform:
            translateY(-50%);

          pointer-events: none;
        }

        .subscription-orbit {
          position: absolute;
          inset: 0;

          border:
            1px dashed
            rgba(169, 121, 31, 0.25);

          border-radius: 50%;

          animation:
            subscriptionRotate 28s
            linear
            infinite;
        }

        .subscription-orbit::before,
        .subscription-orbit::after {
          content: "";

          position: absolute;

          width: 8px;
          height: 8px;

          border-radius: 50%;

          background: var(--gold);

          box-shadow:
            0 0 0 6px
              rgba(169, 121, 31, 0.09);
        }

        .subscription-orbit::before {
          top: 12%;
          left: 17%;
        }

        .subscription-orbit::after {
          right: 8%;
          bottom: 20%;
        }

        .subscription-pass {
          position: absolute;

          top: 50%;
          left: 50%;

          width: 135px;
          height: 82px;

          transform:
            translate(-50%, -50%)
            rotate(-5deg);

          border-radius: 15px;

          background:
            linear-gradient(
              135deg,
              var(--navy),
              #20385F
            );

          box-shadow:
            0 20px 38px
              rgba(20, 33, 61, 0.22);

          animation:
            subscriptionFloat 4.5s
            ease-in-out
            infinite;
        }

        .subscription-pass::before {
          content: "";

          position: absolute;

          top: 12px;
          left: 14px;

          width: 34px;
          height: 22px;

          border-radius: 6px;

          background:
            linear-gradient(
              135deg,
              #E4C77A,
              #A9791F
            );
        }

        .subscription-pass-title {
          position: absolute;

          left: 14px;
          bottom: 16px;

          color: rgba(255, 255, 255, 0.86);

          font-size: 9px;
          font-weight: 800;

          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .subscription-pass-line {
          position: absolute;

          right: 14px;
          bottom: 17px;

          width: 42px;
          height: 4px;

          border-radius: 99px;

          background:
            rgba(255, 255, 255, 0.30);
        }

        .subscription-check {
          position: absolute;

          top: 50%;
          left: 50%;

          display: grid;
          place-items: center;

          width: 43px;
          height: 43px;

          transform:
            translate(-50%, -50%);

          border-radius: 50%;

          background:
            var(--cream);

          color: var(--gold);

          font-size: 19px;
          font-weight: 900;

          box-shadow:
            0 9px 22px
              rgba(20, 33, 61, 0.16);

          animation:
            subscriptionCheck 2.8s
            ease-in-out
            infinite;
        }

        /* =========================================
           SUMMARY CARDS
        ========================================= */

        .subscription-info-grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 13px;

          margin: 0 0 32px;
        }

        .subscription-info-card {
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

        .subscription-info-card:hover {
          transform:
            translateY(-3px);

          border-color:
            rgba(169, 121, 31, 0.18);

          box-shadow:
            0 14px 32px
              rgba(20, 33, 61, 0.07);
        }

        .subscription-info-card::after {
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

        .subscription-info-icon {
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

        .subscription-info-card h3 {
          margin: 0;

          color: var(--navy);

          font-size: 13px;
          font-weight: 800;
        }

        .subscription-info-card p {
          margin: 7px 0 0;

          color: #778091;

          font-size: 11px;
          line-height: 1.55;
        }

        /* =========================================
           CONTENT LAYOUT
        ========================================= */

        .subscription-layout {
          position: relative;
        }

        .subscription-navigation {
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

        .subscription-navigation-title {
          margin: 0 0 12px;

          color: var(--navy);

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .subscription-navigation a {
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

        .subscription-navigation a:hover {
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

        .subscription-content {
          animation:
            subscriptionContentIn 0.7s
            0.12s
            cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .subscription-section {
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

        .subscription-section:hover {
          transform:
            translateY(-2px);

          border-color:
            rgba(169, 121, 31, 0.16);

          box-shadow:
            0 13px 34px
              rgba(20, 33, 61, 0.065);
        }

        .subscription-section h2 {
          position: relative;

          margin-top: 0;

          padding-left: 16px;

          color:
            var(--navy);
        }

        .subscription-section h2::before {
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

        .subscription-section p:last-child {
          margin-bottom: 0;
        }

        .subscription-section strong {
          color:
            var(--navy);
        }

        .subscription-section a {
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

        .subscription-section a:hover {
          color:
            var(--navy);

          text-decoration-color:
            var(--navy);
        }

        /* =========================================
           ACCESS FLOW
        ========================================= */

        .access-flow {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 10px;

          margin-top: 22px;
        }

        .access-step {
          position: relative;

          padding: 14px;

          border:
            1px solid
            rgba(20, 33, 61, 0.08);

          border-radius: 11px;

          background:
            rgba(238, 242, 237, 0.65);
        }

        .access-step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          width: 25px;
          height: 25px;

          margin-bottom: 8px;

          border-radius: 7px;

          background:
            var(--navy);

          color:
            var(--gold-light);

          font-size: 10px;
          font-weight: 800;
        }

        .access-step h3 {
          margin: 0;

          color:
            var(--navy);

          font-size: 11px;
          font-weight: 800;
        }

        .access-step p {
          margin: 5px 0 0;

          color:
            #788292;

          font-size: 10px;

          line-height: 1.5;
        }

        /* =========================================
           CONTACT CARD
        ========================================= */

        .subscription-contact {
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

        .subscription-contact-icon {
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

        .subscription-contact-label {
          margin: 0;

          color:
            #7A8494;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .subscription-contact-email {
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

        .subscription-notice {
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

        .subscription-notice::before {
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

        .subscription-notice-title {
          display: flex;
          align-items: center;
          gap: 9px;

          margin-bottom: 6px;

          color:
            var(--navy);

          font-size: 12px;
          font-weight: 800;
        }

        .subscription-notice-icon {
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

        .subscription-notice p {
          margin: 0;

          color:
            #687386;

          font-size: 11px;
          line-height: 1.7;
        }

        /* =========================================
           FOOTER
        ========================================= */

        .subscription-footer {
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

        .subscription-footer-brand {
          color:
            var(--navy);

          font-size: 12px;
          font-weight: 800;
        }

        .subscription-footer-text {
          color:
            #8A93A1;

          font-size: 10px;
        }

        /* =========================================
           ANIMATIONS
        ========================================= */

        @keyframes subscriptionHeroIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes subscriptionContentIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes subscriptionPulse {
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

        @keyframes subscriptionRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes subscriptionFloat {
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

        @keyframes subscriptionCheck {
          0%,
          100% {
            transform:
              translate(-50%, -50%)
              scale(1);
          }

          50% {
            transform:
              translate(-50%, -50%)
              scale(1.08);
          }
        }

        /* =========================================
           RESPONSIVE
        ========================================= */

        @media (max-width: 900px) {
          .subscription-visual {
            right: 3%;
            opacity: 0.5;
          }

          .subscription-navigation {
            display: none;
          }

          .subscription-info-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .subscription-hero {
            padding: 28px 22px;
            border-radius: 18px;
          }

          .subscription-visual {
            width: 135px;
            height: 135px;

            right: -6px;
            top: 22px;

            transform: none;

            opacity: 0.23;
          }

          .subscription-pass {
            width: 92px;
            height: 58px;
          }

          .subscription-pass::before {
            top: 9px;
            left: 10px;

            width: 24px;
            height: 15px;
          }

          .subscription-pass-title {
            left: 10px;
            bottom: 10px;
          }

          .subscription-pass-line {
            right: 10px;
            bottom: 12px;

            width: 30px;
          }

          .subscription-check {
            width: 38px;
            height: 38px;

            font-size: 17px;
          }

          .subscription-meta {
            display: grid;
            grid-template-columns: 1fr;
          }

          .subscription-info-grid {
            grid-template-columns: 1fr;
          }

          .subscription-section {
            padding: 21px 19px;
            border-radius: 14px;
          }

          .access-flow {
            grid-template-columns: 1fr;
          }

          .subscription-contact {
            align-items: flex-start;
          }

          .subscription-footer {
            align-items: flex-start;
            flex-direction: column;
            gap: 7px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .subscription-page *,
          .subscription-page *::before,
          .subscription-page *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* =========================================
          HERO
      ========================================= */}

      <section className="subscription-hero">
        <div className="subscription-hero-content">
          <div className="subscription-status">
            <span className="subscription-status-dot" />
            Paid Access & Subscriptions
          </div>

          <h2 className="subscription-hero-title">
            Know exactly what
            <br />
            your access includes.
          </h2>

          <p className="subscription-hero-description">
            These Subscription Terms explain the rules that
            apply when you purchase a paid Accqudo test package
            or subscription.
          </p>

          <div className="subscription-meta">
            <div className="subscription-meta-item">
              <span className="subscription-meta-icon">
                ✓
              </span>
              Package access
            </div>

            <div className="subscription-meta-item">
              <span className="subscription-meta-icon">
                ✓
              </span>
              Validity
            </div>

            <div className="subscription-meta-item">
              <span className="subscription-meta-icon">
                ✓
              </span>
              Payment terms
            </div>
          </div>
        </div>

        {/* Animated subscription graphic */}

        <div
          className="subscription-visual"
          aria-hidden="true"
        >
          <div className="subscription-orbit" />

          <div className="subscription-pass">
            <div className="subscription-pass-title">
              ACCQUDO ACCESS
            </div>

            <div className="subscription-pass-line" />
          </div>

          <div className="subscription-check">
            ✓
          </div>
        </div>
      </section>

      {/* =========================================
          SUMMARY CARDS
      ========================================= */}

      <div className="subscription-info-grid">
        <div className="subscription-info-card">
          <div className="subscription-info-icon">
            01
          </div>

          <h3>Know your package</h3>

          <p>
            The package description at purchase defines the
            included tests, features, price and validity.
          </p>
        </div>

        <div className="subscription-info-card">
          <div className="subscription-info-icon">
            02
          </div>

          <h3>Access after payment</h3>

          <p>
            Paid access is activated after successful payment
            confirmation is received and verified.
          </p>
        </div>

        <div className="subscription-info-card">
          <div className="subscription-info-icon">
            03
          </div>

          <h3>Transparent renewal</h3>

          <p>
            Recurring billing is only applicable where it is
            clearly disclosed and authorized before purchase.
          </p>
        </div>
      </div>

      {/* =========================================
          CONTENT + NAVIGATION
      ========================================= */}

      <div className="subscription-layout">
        <aside className="subscription-navigation">
          <p className="subscription-navigation-title">
            On this page
          </p>

          <a href="#purchase">
            1. What you purchase
          </a>

          <a href="#activation">
            2. Access begins after payment
          </a>

          <a href="#validity">
            3. Validity
          </a>

          <a href="#contents">
            4. Package contents
          </a>

          <a href="#recurring">
            5. Recurring billing
          </a>

          <a href="#cancellation">
            6. Cancellation
          </a>

          <a href="#refunds">
            7. Refunds
          </a>

          <a href="#sharing">
            8. Account sharing
          </a>

          <a href="#changes">
            9. Content & feature changes
          </a>

          <a href="#payment-issues">
            10. Payment issues
          </a>

          <a href="#guarantee">
            11. Examination guarantee
          </a>

          <a href="#contact">
            12. Contact
          </a>
        </aside>

        <div className="subscription-content">
          {/* =====================================
              1
          ===================================== */}

          <section
            id="purchase"
            className="subscription-section"
          >
            <h2>1. What you purchase</h2>

            <p>
              Accqudo packages provide digital access to the
              tests, features and access period shown for the
              selected package at the time of purchase.
            </p>

            <p>
              The exact package price, validity period and
              included content are displayed on the Accqudo
              website.
            </p>
          </section>

          {/* =====================================
              2
          ===================================== */}

          <section
            id="activation"
            className="subscription-section"
          >
            <h2>
              2. Access begins after successful payment
            </h2>

            <p>
              Paid access is activated after Accqudo receives
              and verifies successful payment confirmation.
            </p>

            <p>
              If payment is unsuccessful or remains
              unconfirmed, premium access may not be
              activated.
            </p>

            <div className="access-flow">
              <div className="access-step">
                <div className="access-step-number">
                  01
                </div>

                <h3>Payment</h3>

                <p>
                  Complete the applicable payment process.
                </p>
              </div>

              <div className="access-step">
                <div className="access-step-number">
                  02
                </div>

                <h3>Verification</h3>

                <p>
                  Payment confirmation is received and
                  verified.
                </p>
              </div>

              <div className="access-step">
                <div className="access-step-number">
                  03
                </div>

                <h3>Access</h3>

                <p>
                  Eligible premium package access is
                  activated.
                </p>
              </div>
            </div>
          </section>

          {/* =====================================
              3
          ===================================== */}

          <section
            id="validity"
            className="subscription-section"
          >
            <h2>3. Validity</h2>

            <p>
              Package access is available for the validity
              period displayed for that package.
            </p>

            <p>
              The account may retain historical attempt
              information after access expires, subject to
              applicable data-retention practices, but premium
              entitlements may end when the purchased access
              period ends.
            </p>
          </section>

          {/* =====================================
              4
          ===================================== */}

          <section
            id="contents"
            className="subscription-section"
          >
            <h2>4. Package contents</h2>

            <p>
              Package contents may include tests organised by
              exam, subject, chapter, topic or other categories
              supported by the Accqudo platform.
            </p>

            <p>
              The package description shown at purchase is the
              authoritative description of what is included in
              that package.
            </p>
          </section>

          {/* =====================================
              5
          ===================================== */}

          <section
            id="recurring"
            className="subscription-section"
          >
            <h2>5. Recurring billing</h2>

            <p>
              Accqudo will not treat a one-time package as a
              recurring subscription unless recurring billing is
              clearly disclosed before purchase and the user
              completes the applicable recurring-payment
              authorization.
            </p>

            <p>
              If Accqudo offers auto-renewing plans in the
              future, the checkout will state the renewal
              amount, frequency, cancellation method and other
              material terms before authorization.
            </p>
          </section>

          {/* =====================================
              6
          ===================================== */}

          <section
            id="cancellation"
            className="subscription-section"
          >
            <h2>6. Cancellation</h2>

            <p>
              Where recurring billing is offered, users will be
              provided with a cancellation mechanism
              appropriate to the payment flow.
            </p>

            <p>
              Cancellation prevents future renewal according to
              the applicable plan terms; it does not necessarily
              reverse a period that has already begun.
            </p>
          </section>

          {/* =====================================
              7
          ===================================== */}

          <section
            id="refunds"
            className="subscription-section"
          >
            <h2>7. Refunds</h2>

            <p>
              Refunds are handled under the{" "}
              <a href="/info/refund-policy">
                Refund &amp; Cancellation Policy
              </a>{" "}
              and applicable law.
            </p>
          </section>

          {/* =====================================
              8
          ===================================== */}

          <section
            id="sharing"
            className="subscription-section"
          >
            <h2>8. Account sharing</h2>

            <p>
              Paid access is intended for the account holder.
              Sharing credentials or attempting to provide
              unauthorized access to other people may result in
              security restrictions or suspension in accordance
              with the Terms of Use.
            </p>
          </section>

          {/* =====================================
              9
          ===================================== */}

          <section
            id="changes"
            className="subscription-section"
          >
            <h2>
              9. Content and feature changes
            </h2>

            <p>
              Accqudo may update, correct or improve tests,
              explanations, analytics and platform features.
            </p>

            <p>
              Changes will not be used to misrepresent the
              purchased package or remove rights that cannot
              lawfully be excluded.
            </p>
          </section>

          {/* =====================================
              10
          ===================================== */}

          <section
            id="payment-issues"
            className="subscription-section"
          >
            <h2>10. Payment issues</h2>

            <p>
              If payment is debited but the package is not
              activated, contact{" "}
              <a href="mailto:accqudo@gmail.com">
                accqudo@gmail.com
              </a>{" "}
              with the payment reference.
            </p>

            <p>
              Accqudo will investigate the transaction and
              reconcile the payment status.
            </p>
          </section>

          {/* =====================================
              11
          ===================================== */}

          <section
            id="guarantee"
            className="subscription-section"
          >
            <h2>11. No examination guarantee</h2>

            <p>
              Buying an Accqudo package does not guarantee
              selection, admission, rank, percentile or any
              other result in an external examination.
            </p>

            <p>
              Accqudo is a preparation and practice platform.
            </p>
          </section>

          {/* =====================================
              12
          ===================================== */}

          <section
            id="contact"
            className="subscription-section"
          >
            <h2>12. Contact</h2>

            <p>
              Subscription support:
            </p>

            <div className="subscription-contact">
              <div className="subscription-contact-icon">
                @
              </div>

              <div>
                <p className="subscription-contact-label">
                  Subscription support
                </p>

                <a
                  href="mailto:accqudo@gmail.com"
                  className="subscription-contact-email"
                >
                  accqudo@gmail.com
                </a>
              </div>
            </div>
          </section>

          {/* =====================================
              LEGAL NOTICE
          ===================================== */}

          <div className="subscription-notice">
            <div className="subscription-notice-title">
              <span className="subscription-notice-icon">
                !
              </span>

              Important product & legal note
            </div>

            <p>
              Your current homepage displays package validity
              and price from the live database. This page
              intentionally does not invent a renewal schedule
              because the supplied product code does not
              establish that your current packages are
              auto-renewing subscriptions.
            </p>
          </div>

          {/* =====================================
              FOOTER
          ===================================== */}

          <div className="subscription-footer">
            <div className="subscription-footer-brand">
              Accqudo
            </div>

            <div className="subscription-footer-text">
              Clear access · Transparent terms ·
              Better preparation
            </div>
          </div>
        </div>
      </div>
    </InfoShell>
  );
}