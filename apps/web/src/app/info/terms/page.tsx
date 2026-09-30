import { InfoShell } from "../_components/InfoShell";

export const metadata = {
  title: "Terms of Use | Accqudo",
  description: "Terms governing use of the Accqudo online exam-practice platform.",
};

export default function TermsPage() {
  return (
    <InfoShell title="Terms of Use" eyebrow="Accqudo · Terms">
      <p>
        These Terms of Use govern access to and use of the Accqudo website and online
        exam-practice services. By creating an account or using Accqudo, you agree to comply
        with these Terms and applicable law.
      </p>

      <h2>1. About Accqudo</h2>
      <p>
        Accqudo is an independent online educational test-preparation platform. It provides
        structured practice through test series, chapter/topic/subject tests, mock tests,
        attempts, results and performance-related features.
      </p>
      <p>
        Accqudo is not affiliated with or endorsed by an examination authority unless a specific
        affiliation is expressly stated on the relevant Accqudo page or communication.
      </p>

      <h2>2. Eligibility and accounts</h2>
      <p>
        You must provide accurate information when creating an account and keep your login
        credentials secure. You are responsible for activity performed through your account,
        except where applicable law provides otherwise.
      </p>
      <p>
        If you are a minor, use of Accqudo may be subject to applicable parental or guardian
        consent requirements.
      </p>

      <h2>3. Educational use</h2>
      <p>
        Accqudo is a practice and preparation service. Test scores, rankings, analytics and
        performance indicators are intended to help users practise and evaluate their progress.
        They do not guarantee admission, selection, rank, percentile or any result in an
        external examination.
      </p>

      <h2>4. User responsibilities</h2>
      <p>You agree not to:</p>
      <ul>
        <li>share or sell your account or paid access;</li>
        <li>copy, reproduce, publish, resell or commercially exploit Accqudo content without permission;</li>
        <li>scrape or bulk-extract questions, answers, explanations or other protected content;</li>
        <li>attempt to bypass access controls, payment controls or security measures;</li>
        <li>introduce malicious code or interfere with the platform;</li>
        <li>submit fraudulent payment information or misuse refunds;</li>
        <li>manipulate leaderboards, results or other platform data; or</li>
        <li>use the platform for an unlawful purpose.</li>
      </ul>

      <h2>5. Intellectual property</h2>
      <p>
        The Accqudo brand, software, interface, design, database structure, original question
        content, explanations, graphics and other Accqudo-owned materials are protected by
        applicable intellectual-property laws. Your subscription or account gives you a
        limited right to use the service; it does not transfer ownership of Accqudo content.
      </p>

      <h2>6. Third-party services</h2>
      <p>
        Some parts of Accqudo may depend on third-party services such as payment, hosting,
        authentication, email or analytics providers. Those services may have their own terms
        and privacy policies.
      </p>

      <h2>7. Availability and changes</h2>
      <p>
        Accqudo may add, remove or modify tests, packages, features and content. We aim to keep
        the service available and accurate, but online services can experience outages,
        maintenance, errors or interruptions.
      </p>

      <h2>8. Payments, subscriptions and refunds</h2>
      <p>
        Paid access is governed by the plan and pricing displayed at the time of purchase.
        Additional rules concerning access duration, cancellation, renewal and refunds are set
        out in the Subscription Terms and Refund Policy.
      </p>

      <h2>9. Suspension or termination</h2>
      <p>
        Accqudo may restrict or suspend access where reasonably necessary to protect the service,
        investigate abuse, address security risks, enforce these Terms or comply with law.
        Where appropriate, users will be given an opportunity to contact support.
      </p>

      <h2>10. Accuracy of content</h2>
      <p>
        Accqudo works to provide useful and accurate educational content. However, educational
        content may contain errors or become outdated. If you identify an incorrect question,
        answer or explanation, please report it to{" "}
        <a href="mailto:accqudo@gmail.com">accqudo@gmail.com</a>.
      </p>

      <h2>11. Examination authority disclaimer</h2>
      <p>
        References to examinations, examination names or related preparation categories are for
        identification and preparation purposes. Unless expressly stated, Accqudo does not
        represent that it is affiliated with, sponsored by or endorsed by the relevant
        examination authority.
      </p>

      <h2>12. Contact</h2>
      <p>
        For support or questions about these Terms, contact{" "}
        <a href="mailto:accqudo@gmail.com">accqudo@gmail.com</a>.
      </p>

      <div className="not-prose mt-8 border-l-4 border-[#A9791F] bg-[#EEF2ED] p-4 text-xs leading-relaxed text-[#4B5768]">
        These Terms should be reviewed and finalized by qualified Indian legal counsel before
        they are treated as the definitive contractual terms for paid users.
      </div>
    </InfoShell>
  );
}
