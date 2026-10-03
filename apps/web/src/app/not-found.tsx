import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <style>{`
        .not-found-page {
          --navy: #14213d;
          --navy-deep: #0b1428;
          --gold: #c89b3c;
          --gold-light: #e4c77a;
          --cream: #f7f5ee;
          --cream-dark: #ebe8dc;
          --text: #263247;
          --muted: #687386;
          --white: #ffffff;

          position: relative;
          min-height: 100vh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          background:
            radial-gradient(
              circle at 50% 45%,
              rgba(200, 155, 60, 0.10) 0,
              rgba(200, 155, 60, 0.04) 18%,
              transparent 42%
            ),
            linear-gradient(
              135deg,
              #f8f7f1 0%,
              #eef2ed 50%,
              #e8eee9 100%
            );
          color: var(--navy);
          isolation: isolate;
        }

        .not-found-page::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -2;
          opacity: 0.38;
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
          background-size: 42px 42px;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 20%,
            black 80%,
            transparent
          );
        }

        .not-found-page::after {
          content: "";
          position: absolute;
          width: 520px;
          height: 520px;
          border-radius: 50%;
          border: 1px solid rgba(200, 155, 60, 0.13);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: -1;
          box-shadow:
            0 0 0 80px rgba(200, 155, 60, 0.025),
            0 0 0 160px rgba(200, 155, 60, 0.018);
        }

        .not-found-shell {
          position: relative;
          width: min(100%, 900px);
          text-align: center;
          animation: pageEnter 0.8s cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 34px;
          color: var(--navy);
          text-decoration: none;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .brand-mark {
          position: relative;
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: var(--navy);
          color: var(--gold-light);
          box-shadow:
            0 8px 22px rgba(20, 33, 61, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.12);
        }

        .brand-mark::before {
          content: "";
          width: 15px;
          height: 19px;
          border: 2px solid currentColor;
          border-top: 0;
          border-radius: 2px 2px 5px 5px;
          transform: rotate(-4deg);
        }

        .brand-mark::after {
          content: "";
          position: absolute;
          width: 2px;
          height: 21px;
          background: currentColor;
          border-radius: 2px;
          transform: rotate(-4deg);
        }

        .error-badge {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 8px 14px;
          border: 1px solid rgba(200, 155, 60, 0.28);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.58);
          color: #8b691e;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 30px rgba(20, 33, 61, 0.04);
        }

        .error-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 0 5px rgba(200, 155, 60, 0.12);
          animation: pulse 2s ease-in-out infinite;
        }

        .error-number-wrap {
          position: relative;
          width: min(100%, 720px);
          margin: 20px auto 0;
        }

        .error-number {
          margin: 0;
          color: var(--navy);
          font-size: clamp(120px, 25vw, 270px);
          line-height: 0.82;
          font-weight: 900;
          letter-spacing: -0.09em;
          user-select: none;
          text-shadow:
            2px 2px 0 rgba(200, 155, 60, 0.22),
            5px 5px 0 rgba(20, 33, 61, 0.035);
          animation: numberReveal 1s
            cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .gold-line {
          position: absolute;
          width: 150px;
          height: 5px;
          left: 50%;
          bottom: 5%;
          transform: translateX(-50%) rotate(-3deg);
          border-radius: 99px;
          background: linear-gradient(
            90deg,
            transparent,
            var(--gold),
            var(--gold-light),
            transparent
          );
          box-shadow: 0 0 18px rgba(200, 155, 60, 0.28);
          animation: lineDraw 1.2s
            0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .content {
          position: relative;
          z-index: 2;
          max-width: 650px;
          margin: 26px auto 0;
        }

        .content h1 {
          margin: 0;
          font-size: clamp(30px, 5vw, 48px);
          line-height: 1.1;
          font-weight: 800;
          letter-spacing: -0.045em;
          color: var(--navy);
          animation: fadeUp 0.7s 0.25s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .content p {
          max-width: 570px;
          margin: 17px auto 0;
          color: var(--muted);
          font-size: clamp(15px, 2vw, 17px);
          line-height: 1.75;
          animation: fadeUp 0.7s 0.35s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 30px;
          animation: fadeUp 0.7s 0.45s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .primary-button,
        .secondary-button {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 21px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            background 0.25s ease;
        }

        .primary-button {
          overflow: hidden;
          background: var(--navy);
          color: var(--white);
          box-shadow:
            0 10px 24px rgba(20, 33, 61, 0.18),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .primary-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -120%;
          width: 70%;
          height: 100%;
          transform: skewX(-20deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.16),
            transparent
          );
          transition: left 0.55s ease;
        }

        .primary-button:hover::before {
          left: 140%;
        }

        .primary-button:hover {
          transform: translateY(-3px);
          box-shadow:
            0 15px 30px rgba(20, 33, 61, 0.23),
            0 0 0 4px rgba(200, 155, 60, 0.10);
        }

        .secondary-button {
          border: 1px solid rgba(20, 33, 61, 0.12);
          background: rgba(255, 255, 255, 0.58);
          color: var(--navy);
          backdrop-filter: blur(10px);
        }

        .secondary-button:hover {
          transform: translateY(-3px);
          background: var(--white);
          box-shadow: 0 12px 25px rgba(20, 33, 61, 0.09);
        }

        .arrow {
          display: inline-block;
          margin-left: 8px;
          transition: transform 0.25s ease;
        }

        .primary-button:hover .arrow {
          transform: translateX(4px);
        }

        .academic-card {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border: 1px solid rgba(20, 33, 61, 0.08);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.58);
          color: var(--navy);
          box-shadow: 0 12px 30px rgba(20, 33, 61, 0.07);
          backdrop-filter: blur(10px);
          pointer-events: none;
        }

        .academic-card svg {
          width: 25px;
          height: 25px;
        }

        .card-one {
          left: 7%;
          top: 26%;
          animation:
            floatOne 5s ease-in-out infinite,
            cardAppear 0.8s 0.4s both;
        }

        .card-two {
          right: 8%;
          top: 22%;
          animation:
            floatTwo 6s ease-in-out infinite,
            cardAppear 0.8s 0.55s both;
        }

        .card-three {
          left: 13%;
          bottom: 17%;
          animation:
            floatThree 5.5s ease-in-out infinite,
            cardAppear 0.8s 0.7s both;
        }

        .card-four {
          right: 12%;
          bottom: 14%;
          animation:
            floatOne 6.5s ease-in-out infinite reverse,
            cardAppear 0.8s 0.85s both;
        }

        .orbit {
          position: absolute;
          left: 50%;
          top: 50%;
          width: min(72vw, 720px);
          aspect-ratio: 1;
          transform: translate(-50%, -50%);
          border: 1px dashed rgba(200, 155, 60, 0.18);
          border-radius: 50%;
          pointer-events: none;
          z-index: -1;
          animation: rotateOrbit 45s linear infinite;
        }

        .orbit::before,
        .orbit::after {
          content: "";
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--gold);
          box-shadow: 0 0 0 7px rgba(200, 155, 60, 0.08);
        }

        .orbit::before {
          top: 11%;
          left: 18%;
        }

        .orbit::after {
          right: 10%;
          bottom: 22%;
        }

        .footer-note {
          margin-top: 38px;
          color: #8a93a1;
          font-size: 12px;
          letter-spacing: 0.02em;
          animation: fadeUp 0.7s 0.6s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .footer-note strong {
          color: #626d7d;
          font-weight: 700;
        }

        @keyframes pageEnter {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes numberReveal {
          from {
            opacity: 0;
            transform: scale(0.86);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes lineDraw {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 150px;
            opacity: 1;
          }
        }

        @keyframes pulse {
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

        @keyframes floatOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(-3deg);
          }
          50% {
            transform: translate3d(0, -15px, 0) rotate(3deg);
          }
        }

        @keyframes floatTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(4deg);
          }
          50% {
            transform: translate3d(0, 17px, 0) rotate(-4deg);
          }
        }

        @keyframes floatThree {
          0%,
          100% {
            transform: translate3d(0, 0, 0) rotate(3deg);
          }
          50% {
            transform: translate3d(0, -12px, 0) rotate(-3deg);
          }
        }

        @keyframes cardAppear {
          from {
            opacity: 0;
            scale: 0.7;
          }
          to {
            opacity: 1;
            scale: 1;
          }
        }

        @keyframes rotateOrbit {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }

        @media (max-width: 700px) {
          .not-found-page {
            padding: 32px 18px;
          }

          .brand {
            margin-bottom: 24px;
          }

          .error-number-wrap {
            margin-top: 28px;
          }

          .content {
            margin-top: 24px;
          }

          .content p {
            line-height: 1.65;
          }

          .academic-card {
            width: 45px;
            height: 45px;
            border-radius: 13px;
          }

          .academic-card svg {
            width: 20px;
            height: 20px;
          }

          .card-one {
            left: 2%;
            top: 30%;
          }

          .card-two {
            right: 2%;
            top: 27%;
          }

          .card-three {
            left: 5%;
            bottom: 11%;
          }

          .card-four {
            right: 5%;
            bottom: 9%;
          }

          .orbit {
            width: 125vw;
          }

          .actions {
            flex-direction: column;
          }

          .primary-button,
          .secondary-button {
            width: min(100%, 260px);
          }

          .footer-note {
            margin-top: 28px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .not-found-page *,
          .not-found-page *::before,
          .not-found-page *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Decorative orbit */}
      <div className="orbit" aria-hidden="true" />

      {/* Floating academic graphics */}
      <div className="academic-card card-one" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
          <path d="M8 6h8" />
          <path d="M8 10h6" />
        </svg>
      </div>

      <div className="academic-card card-two" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
          <path d="M7 10v5.5c0 1.7 2.2 3.5 5 3.5s5-1.8 5-3.5V10" />
          <path d="M21 7.5V13" />
        </svg>
      </div>

      <div className="academic-card card-three" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 8h10" />
          <path d="M7 12h3" />
          <path d="M7 16h6" />
          <path d="M16 12h1" />
          <path d="M16 16h1" />
        </svg>
      </div>

      <div className="academic-card card-four" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="m7 15 4-4 3 2 5-7" />
          <path d="M19 6v4h-4" />
        </svg>
      </div>

      <section className="not-found-shell">
        <Link href="/" className="brand" aria-label="Accqudo home">
          <span className="brand-mark" aria-hidden="true" />
          <span>Accqudo</span>
        </Link>

        <div className="error-badge">
          <span className="error-dot" />
          Error 404
        </div>

        <div className="error-number-wrap" aria-hidden="true">
          <div className="error-number">404</div>
          <div className="gold-line" />
        </div>

        <div className="content">
          <h1>Looks like this page missed the test.</h1>

          <p>
            The page you are looking for doesn&apos;t exist, may have
            moved, or the link you followed is no longer available.
            Let&apos;s get you back to your learning journey.
          </p>

          <div className="actions">
            <Link href="/" className="primary-button">
              Back to Accqudo
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </Link>

            <Link href="/dashboard" className="secondary-button">
              Go to Dashboard
            </Link>
          </div>

          <div className="footer-note">
            <strong>Accqudo</strong> · Practice smarter. Prepare better.
          </div>
        </div>
      </section>
    </main>
  );
}