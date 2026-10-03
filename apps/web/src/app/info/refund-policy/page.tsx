import { InfoShell } from "../_components/InfoShell";

export const metadata = {
  title: "Refund Policy | Accqudo",
  description:
    "Accqudo refund and cancellation policy for digital test-series access.",
};

export default function RefundPolicyPage() {
  return (
    <InfoShell
      title="Refund & Cancellation Policy"
      eyebrow="Accqudo · Refunds"
    >
      <style>{`
        .refund-page {
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

        .refund-hero {
          position: relative;
          overflow: hidden;
          margin-bottom: 42px;
          padding: 42px 34px;
          border: 1px solid rgba(20, 33, 61, 0.08);
          border-radius: 24px;

          background:
            radial-gradient(
              circle at 85% 15%,
              rgba(213, 180, 90, 0.20),
              transparent 28%
            ),
            radial-gradient(
              circle at 12% 90%,
              rgba(20, 33, 61, 0.08),
              transparent 32%
            ),
            linear-gradient(
              135deg,
              #F9F8F3 0%,
              #EEF2ED 100%
            );

          box-shadow:
            0 18px 50px rgba(20, 33, 61, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.8);

          animation:
            refundHeroIn 0.7s
            cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .refund-hero::before {
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

          mask-image: linear-gradient(
            to right,
            transparent,
            black 25%,
            black 75%,
            transparent
          );
        }

        .refund-hero-content {
          position: relative;
          z-index: 2;
          max-width: 650px;
        }

        .refund-status {
          display: inline-flex;
          align-items: center;
          gap: 9px;

          padding: 7px 12px;

          border: 1px solid rgba(169, 121, 31, 0.22);
          border-radius: 999px;

          background: rgba(255, 255, 255, 0.58);

          color: #8A6417;

          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;

          backdrop-filter: blur(10px);
        }

        .refund-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;

          background: var(--gold);

          box-shadow:
            0 0 0 5px rgba(169, 121, 31, 0.10);

          animation:
            refundPulse 2.2s
            ease-in-out
            infinite;
        }

        .refund-hero-title {
          margin: 18px 0 0;

          color: var(--navy);

          font-size: clamp(28px, 5vw, 46px);
          line-height: 1.05;

          font-weight: 850;
          letter-spacing: -0.045em;
        }

        .refund-hero-description {
          max-width: 620px;

          margin: 16px 0 0;

          color: var(--muted);

          font-size: 15px;
          line-height: 1.75;
        }

        .refund-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;

          margin-top: 24px;
        }

        .refund-meta-item {
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

        .refund-meta-icon {
          color: var(--gold);
          font-size: 13px;
        }

        /* =========================================
           REFUND HERO GRAPHIC
        ========================================= */

        .refund-visual {
          position: absolute;

          top: 50%;
          right: 7%;

          width: 210px;
          height: 210px;

          transform: translateY(-50%);

          pointer-events: none;
        }

        .refund-orbit {
          position: absolute;
          inset: 0;

          border: 1px dashed
            rgba(169, 121, 31, 0.25);

          border-radius: 50%;

          animation:
            refundRotate 25s
            linear
            infinite;
        }

        .refund-orbit::before,
        .refund-orbit::after {
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

        .refund-orbit::before {
          top: 13%;
          left: 17%;
        }

        .refund-orbit::after {
          right: 9%;
          bottom: 19%;
        }

        .refund-card {
          position: absolute;

          top: 50%;
          left: 50%;

          width: 115px;
          height: 72px;

          transform:
            translate(-50%, -50%)
            rotate(-7deg);

          border-radius: 13px;

          background:
            linear-gradient(
              135deg,
              var(--navy),
              #1D3157
            );

          box-shadow:
            0 18px 35px
            rgba(20, 33, 61, 0.22);

          animation:
            refundCardFloat 4s
            ease-in-out
            infinite;
        }

        .refund-card::before {
          content: "";

          position: absolute;

          top: 13px;
          left: 13px;

          width: 30px;
          height: 20px;

          border-radius: 5px;

          background:
            linear-gradient(
              135deg,
              #E4C77A,
              #A9791F
            );
        }

        .refund-card::after {
          content: "";

          position: absolute;

          right: 13px;
          bottom: 13px;

          width: 38px;
          height: 4px;

          border-radius: 99px;

          background:
            rgba(255, 255, 255, 0.42);
        }

        .refund-arrow {
          position: absolute;

          top: 50%;
          left: 50%;

          display: grid;
          place-items: center;

          width: 45px;
          height: 45px;

          transform:
            translate(-50%, -50%)
            translateY(1px);

          border-radius: 50%;

          background: var(--cream);

          color: var(--gold);

          font-size: 22px;
          font-weight: 800;

          box-shadow:
            0 8px 20px
            rgba(20, 33, 61, 0.15);

          animation:
            refundArrowPulse 2.5s
            ease-in-out
            infinite;
        }

        /* =========================================
           QUICK SUMMARY
        ========================================= */

        .refund-info-grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0, 1fr));

          gap: 13px;

          margin: 0 0 32px;
        }

        .refund-info-card {
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

        .refund-info-card:hover {
          transform: translateY(-3px);

          border-color:
            rgba(169, 121, 31, 0.18);

          box-shadow:
            0 14px 32px
            rgba(20, 33, 61, 0.07);
        }

        .refund-info-card::after {
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

        .refund-info-icon {
          display: grid;
          place-items: center;

          width: 34px;
          height: 34px;

          margin-bottom: 11px;

          border-radius: 9px;

          background: var(--navy);

          color: var(--gold-light);

          font-size: 14px;
          font-weight: 800;
        }

        .refund-info-card h3 {
          margin: 0;

          color: var(--navy);

          font-size: 13px;
          font-weight: 800;
        }

        .refund-info-card p {
          margin: 7px 0 0;

          color: #778091;

          font-size: 11px;
          line-height: 1.55;
        }

        /* =========================================
           LAYOUT
        ========================================= */

        .refund-layout {
          position: relative;
        }

        .refund-navigation {
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

        .refund-navigation-title {
          margin: 0 0 12px;

          color: var(--navy);

          font-size: 11px;
          font-weight: 800;

          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .refund-navigation a {
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

        .refund-navigation a:hover {
          background: var(--cream-dark);

          color: var(--navy);

          transform: translateX(2px);
        }

        /* =========================================
           POLICY SECTIONS
        ========================================= */

        .refund-content {
          animation:
            refundContentIn 0.7s
            0.12s
            cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .refund-section {
          position: relative;

          margin: 0 0 30px;

          padding: 26px 27px;

          border: 1px solid
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

        .refund-section:hover {
          transform: translateY(-2px);

          border-color:
            rgba(169, 121, 31, 0.16);

          box-shadow:
            0 13px 34px
            rgba(20, 33, 61, 0.065);
        }

        .refund-section h2 {
          position: relative;

          margin-top: 0;

          padding-left: 16px;

          color: var(--navy);
        }

        .refund-section h2::before {
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

        .refund-section p:last-child {
          margin-bottom: 0;
        }

        .refund-section strong {
          color: var(--navy);
        }

        .refund-section a {
          color: #896519;

          font-weight: 650;

          text-decoration-color:
            rgba(169, 121, 31, 0.35);

          text-underline-offset: 3px;

          transition:
            color 0.2s ease,
            text-decoration-color 0.2s ease;
        }

        .refund-section a:hover {
          color: var(--navy);

          text-decoration-color: var(--navy);
        }

        /* =========================================
           CONTACT CARD
        ========================================= */

        .refund-contact {
          display: flex;
          align-items: center;
          gap: 16px;

          margin-top: 8px;
          margin-bottom: 30px;

          padding: 20px 22px;

          border: 1px solid
            rgba(20, 33, 61, 0.08);

          border-radius: 15px;

          background:
            linear-gradient(
              135deg,
              rgba(20, 33, 61, 0.04),
              rgba(169, 121, 31, 0.07)
            );
        }

        .refund-contact-icon {
          display: grid;
          place-items: center;

          flex: 0 0 auto;

          width: 42px;
          height: 42px;

          border-radius: 12px;

          background: var(--navy);

          color: var(--gold-light);

          font-size: 17px;

          box-shadow:
            0 8px 20px
            rgba(20, 33, 61, 0.12);
        }

        .refund-contact-content {
          min-width: 0;
        }

        .refund-contact-label {
          margin: 0;

          color: #7A8494;

          font-size: 10px;
          font-weight: 800;

          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .refund-contact-email {
          display: inline-block;

          margin-top: 3px;

          color: var(--navy);

          font-size: 13px;
          font-weight: 750;

          text-decoration: none;
        }

        /* =========================================
           LEGAL NOTICE
        ========================================= */

        .refund-notice {
          position: relative;

          overflow: hidden;

          margin-top: 34px;

          padding:
            21px
            22px
            21px
            25px;

          border: 1px solid
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

        .refund-notice::before {
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

        .refund-notice-title {
          display: flex;
          align-items: center;
          gap: 9px;

          margin-bottom: 6px;

          color: var(--navy);

          font-size: 12px;
          font-weight: 800;
        }

        .refund-notice-icon {
          display: grid;
          place-items: center;

          width: 23px;
          height: 23px;

          border-radius: 7px;

          background: var(--navy);

          color: var(--gold-light);

          font-size: 11px;
        }

        .refund-notice p {
          margin: 0;

          color: #687386;

          font-size: 11px;
          line-height: 1.7;
        }

        /* =========================================
           FOOTER
        ========================================= */

        .refund-footer {
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

        .refund-footer-brand {
          color: var(--navy);

          font-size: 12px;
          font-weight: 800;
        }

        .refund-footer-text {
          color: #8A93A1;

          font-size: 10px;
        }

        /* =========================================
           ANIMATIONS
        ========================================= */

        @keyframes refundHeroIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes refundContentIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes refundPulse {
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

        @keyframes refundRotate {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes refundCardFloat {
          0%,
          100% {
            transform:
              translate(-50%, -50%)
              rotate(-7deg)
              translateY(0);
          }

          50% {
            transform:
              translate(-50%, -50%)
              rotate(-4deg)
              translateY(-8px);
          }
        }

        @keyframes refundArrowPulse {
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
          .refund-visual {
            right: 3%;
            opacity: 0.5;
          }

          .refund-navigation {
            display: none;
          }

          .refund-info-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .refund-hero {
            padding: 28px 22px;
            border-radius: 18px;
          }

          .refund-visual {
            width: 135px;
            height: 135px;

            right: -6px;
            top: 22px;

            transform: none;

            opacity: 0.23;
          }

          .refund-card {
            width: 88px;
            height: 56px;
          }

          .refund-card::before {
            top: 10px;
            left: 10px;

            width: 23px;
            height: 15px;
          }

          .refund-card::after {
            right: 10px;
            bottom: 10px;

            width: 30px;
          }

          .refund-arrow {
            width: 38px;
            height: 38px;

            font-size: 18px;
          }

          .refund-meta {
            display: grid;
            grid-template-columns: 1fr;
          }

          .refund-info-grid {
            grid-template-columns: 1fr;
          }

          .refund-section {
            padding: 21px 19px;
            border-radius: 14px;
          }

          .refund-contact {
            align-items: flex-start;
          }

          .refund-footer {
            align-items: flex-start;
            flex-direction: column;
            gap: 7px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .refund-page *,
          .refund-page *::before,
          .refund-page *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* =========================================
          HERO
      ========================================= */}

      <section className="refund-hero">
        <div className="refund-hero-content">
          <div className="refund-status">
            <span className="refund-status-dot" />
            Payments & Refunds
          </div>

          <h2 className="refund-hero-title">
            Clear terms for
            <br />
            every transaction.
          </h2>

          <p className="refund-hero-description">
            This policy explains how Accqudo handles
            cancellations, refunds and payment issues for
            digital test-series and subscription access.
          </p>

          <div className="refund-meta">
            <div className="refund-meta-item">
              <span className="refund-meta-icon">✓</span>
              Digital services
            </div>

            <div className="refund-meta-item">
              <span className="refund-meta-icon">✓</span>
              Payment review
            </div>

            <div className="refund-meta-item">
              <span className="refund-meta-icon">✓</span>
              Refund support
            </div>
          </div>
        </div>

        {/* Animated payment graphic */}

        <div
          className="refund-visual"
          aria-hidden="true"
        >
          <div className="refund-orbit" />

          <div className="refund-card" />

          <div className="refund-arrow">
            ↩
          </div>
        </div>
      </section>

      {/* =========================================
          QUICK SUMMARY
      ========================================= */}

      <div className="refund-info-grid">
        <div className="refund-info-card">
          <div className="refund-info-icon">
            01
          </div>

          <h3>Review before purchase</h3>

          <p>
            Check the package, features, duration,
            price and applicable taxes before payment.
          </p>
        </div>

        <div className="refund-info-card">
          <div className="refund-info-icon">
            02
          </div>

          <h3>Request a review</h3>

          <p>
            Contact support with your account and
            payment reference when a refund issue occurs.
          </p>
        </div>

        <div className="refund-info-card">
          <div className="refund-info-icon">
            03
          </div>

          <h3>Payment reconciliation</h3>

          <p>
            Failed, reversed or unmatched payments can
            be investigated using the transaction details.
          </p>
        </div>
      </div>

      {/* =========================================
          CONTENT + NAVIGATION
      ========================================= */}

      <div className="refund-layout">
        <aside className="refund-navigation">
          <p className="refund-navigation-title">
            On this page
          </p>

          <a href="#digital-service">
            1. Digital service
          </a>

          <a href="#before-purchase">
            2. Before purchasing
          </a>

          <a href="#cancellation">
            3. Cancellation
          </a>

          <a href="#refund-requests">
            4. Refund requests
          </a>

          <a href="#review">
            5. Situations requiring review
          </a>

          <a href="#not-described">
            6. Service not as described
          </a>

          <a href="#processing">
            7. Refund processing
          </a>

          <a href="#failed-payment">
            8. Failed or reversed payments
          </a>

          <a href="#fraud">
            9. Abuse and fraudulent transactions
          </a>

          <a href="#changes">
            10. Changes
          </a>

          <a href="#contact">
            11. Contact
          </a>
        </aside>

        <div className="refund-content">
          {/* =====================================
              1
          ===================================== */}

          <section
            id="digital-service"
            className="refund-section"
          >
            <h2>1. Digital service</h2>

            <p>
              Accqudo provides digital access to online tests,
              mock tests, test series, results and related
              features.
            </p>

            <p>
              Access is delivered electronically to the
              user&apos;s account rather than through physical
              shipment.
            </p>
          </section>

          {/* =====================================
              2
          ===================================== */}

          <section
            id="before-purchase"
            className="refund-section"
          >
            <h2>2. Before purchasing</h2>

            <p>
              Please review the package name, included
              features, access duration, price and any
              applicable taxes displayed at checkout before
              completing payment.
            </p>
          </section>

          {/* =====================================
              3
          ===================================== */}

          <section
            id="cancellation"
            className="refund-section"
          >
            <h2>3. Cancellation</h2>

            <p>
              If a plan provides a cancellation option,
              cancellation will be handled according to the
              plan terms shown at the time of purchase.
            </p>

            <p>
              Cancellation of access does not automatically
              mean that a payment is refundable.
            </p>
          </section>

          {/* =====================================
              4
          ===================================== */}

          <section
            id="refund-requests"
            className="refund-section"
          >
            <h2>4. Refund requests</h2>

            <p>
              Refund requests should be sent to{" "}
              <a href="mailto:accqudo@gmail.com">
                accqudo@gmail.com
              </a>{" "}
              using the email address associated with the
              Accqudo account.
            </p>

            <p>
              Include the account email, order/payment
              reference if available, package purchased and a
              short description of the issue.
            </p>
          </section>

          {/* =====================================
              5
          ===================================== */}

          <section
            id="review"
            className="refund-section"
          >
            <h2>5. Situations requiring review</h2>

            <p>
              Accqudo will review refund requests
              individually, including cases such as duplicate
              payments, payment captured but access not
              activated, material technical failure that
              prevents the purchased service from being
              delivered, or another circumstance where a
              refund is required by applicable law or the
              applicable purchase terms.
            </p>
          </section>

          {/* =====================================
              6
          ===================================== */}

          <section
            id="not-described"
            className="refund-section"
          >
            <h2>6. Service not as described</h2>

            <p>
              If the purchased digital service is materially
              different from the features or access conditions
              represented at purchase, contact support promptly
              so the issue can be investigated and an
              appropriate remedy can be considered.
            </p>
          </section>

          {/* =====================================
              7
          ===================================== */}

          <section
            id="processing"
            className="refund-section"
          >
            <h2>7. Refund processing</h2>

            <p>
              When a refund is approved, the refund will
              normally be initiated through the original
              payment method or the payment provider&apos;s
              supported refund process.
            </p>

            <p>
              The time for the amount to appear can depend on
              the payment provider and banking system.
            </p>
          </section>

          {/* =====================================
              8
          ===================================== */}

          <section
            id="failed-payment"
            className="refund-section"
          >
            <h2>8. Failed or reversed payments</h2>

            <p>
              A failed, reversed or incomplete payment should
              not by itself be treated as a successful
              subscription.
            </p>

            <p>
              If money was debited but Accqudo did not receive
              a successful payment confirmation, contact support
              with the payment reference so the transaction can
              be reconciled.
            </p>
          </section>

          {/* =====================================
              9
          ===================================== */}

          <section
            id="fraud"
            className="refund-section"
          >
            <h2>9. Abuse and fraudulent transactions</h2>

            <p>
              Refund handling may be subject to verification
              where there is suspected payment fraud, account
              abuse, deliberate misuse of the service or
              repeated chargeback activity.
            </p>

            <p>
              This does not limit rights that cannot lawfully
              be excluded.
            </p>
          </section>

          {/* =====================================
              10
          ===================================== */}

          <section
            id="changes"
            className="refund-section"
          >
            <h2>10. Changes</h2>

            <p>
              Accqudo may update this policy when the product,
              payment methods or applicable legal requirements
              change.
            </p>

            <p>
              The version published at the time of purchase
              will be relevant to that purchase, subject to
              applicable law.
            </p>
          </section>

          {/* =====================================
              11
          ===================================== */}

          <section
            id="contact"
            className="refund-section"
          >
            <h2>11. Contact</h2>

            <p>
              Refund and payment support:
            </p>

            <div className="refund-contact">
              <div className="refund-contact-icon">
                @
              </div>

              <div className="refund-contact-content">
                <p className="refund-contact-label">
                  Support email
                </p>

                <a
                  href="mailto:accqudo@gmail.com"
                  className="refund-contact-email"
                >
                  accqudo@gmail.com
                </a>
              </div>
            </div>
          </section>

          {/* =====================================
              LEGAL NOTICE
          ===================================== */}

          <div className="refund-notice">
            <div className="refund-notice-title">
              <span className="refund-notice-icon">
                !
              </span>

              Important legal review note
            </div>

            <p>
              This is a conservative product-level policy.
              Before enabling paid subscriptions at scale,
              have an Indian consumer-law professional review
              the final eligibility rules, cancellation process
              and statutory requirements for your exact payment
              model.
            </p>
          </div>

          {/* =====================================
              FOOTER
          ===================================== */}

          <div className="refund-footer">
            <div className="refund-footer-brand">
              Accqudo
            </div>

            <div className="refund-footer-text">
              Transparent payments · Clear terms ·
              Responsible service
            </div>
          </div>
        </div>
      </div>
    </InfoShell>
  );
}