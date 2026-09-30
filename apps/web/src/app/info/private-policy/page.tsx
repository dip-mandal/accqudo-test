import { InfoShell } from "../_components/InfoShell";

export const metadata = {
  title: "Privacy Policy | Accqudo",
  description: "Accqudo Privacy Policy covering personal data, accounts, test attempts, analytics, payments and user rights.",
};

export default function PrivacyPolicyPage() {
  return (
    <InfoShell title="Privacy Policy" eyebrow="Accqudo · Privacy">
      <p>
        This Privacy Policy explains how Accqudo handles information when you visit or use
        the Accqudo website and its exam-practice services. Accqudo provides online test
        series, mock tests, topic/chapter/subject practice, test attempts and performance
        information.
      </p>

      <h2>1. Information we may collect</h2>
      <p>Depending on how you use the platform, Accqudo may process:</p>
      <ul>
        <li><strong>Account information:</strong> name, email address, mobile number and authentication-related information.</li>
        <li><strong>Academic and usage information:</strong> selected exams, packages, tests attempted, answers submitted, scores, time/attempt information and performance history.</li>
        <li><strong>Transaction information:</strong> subscription/package, payment status, order/reference information and refund information. Payment-card credentials should be handled by the payment provider rather than stored directly by Accqudo.</li>
        <li><strong>Technical information:</strong> IP address, browser/device information, security logs and information needed to keep the service secure and functional.</li>
        <li><strong>Support information:</strong> information you choose to provide when contacting Accqudo.</li>
      </ul>

      <h2>2. How we use information</h2>
      <ul>
        <li>Create and maintain your account.</li>
        <li>Provide test-series, mock-test and assessment functionality.</li>
        <li>Record attempts and generate scores and performance analysis.</li>
        <li>Provide purchased access and manage subscriptions/packages.</li>
        <li>Process or reconcile payments, refunds and related support requests.</li>
        <li>Prevent fraud, abuse, unauthorized access and attacks on the platform.</li>
        <li>Diagnose errors, improve reliability and improve the user experience.</li>
        <li>Communicate with you about your account, transactions, support requests and important service changes.</li>
      </ul>

      <h2>3. Test attempts and performance data</h2>
      <p>
        Test responses, scores, attempts and related performance information may be stored
        as part of the service. This information is used to provide results, attempt history,
        progress information and related features. We do not treat a test score as a guarantee
        of admission, rank or success in any external examination.
      </p>

      <h2>4. Payments and service providers</h2>
      <p>
        Accqudo may use third-party providers for payment processing, authentication, hosting,
        email, analytics, security and other infrastructure. Information shared with a provider
        is limited to what is reasonably necessary for the relevant service and subject to the
        applicable contractual and legal requirements.
      </p>

      <h2>5. Cookies and analytics</h2>
      <p>
        Accqudo may use cookies, local storage and similar technologies for authentication,
        preferences, security and analytics. Browser storage may also be used for session or
        account-related functionality. Where consent is required by applicable law, the relevant
        consent mechanism will be provided.
      </p>

      <h2>6. Data security</h2>
      <p>
        Accqudo uses reasonable technical and organisational measures appropriate to the service,
        including access controls, secure authentication practices, encrypted connections and
        operational monitoring. No internet service can guarantee absolute security.
      </p>

      <h2>7. Data retention</h2>
      <p>
        Personal data is retained for as long as reasonably necessary for the purposes for which
        it was collected, including providing the service, maintaining account and transaction
        records, security, dispute handling and complying with legal obligations. Retention
        periods may differ by data type.
      </p>

      <h2>8. Account deletion and requests</h2>
      <p>
        You may contact Accqudo at{" "}
        <a href="mailto:accqudo@gmail.com">accqudo@gmail.com</a> for account-related privacy
        requests, including requests concerning access, correction, deletion or other rights
        available under applicable law. Some information may need to be retained where required
        by law or reasonably necessary for security, fraud prevention or dispute resolution.
      </p>

      <h2>9. Children and minors</h2>
      <p>
        Accqudo may be used by students preparing for examinations, including students who may
        be below 18. Where applicable law requires verifiable parental or guardian consent for
        processing a child's personal data, Accqudo will use the required consent mechanism.
        We do not intentionally ask students to provide unnecessary sensitive information.
      </p>
      <p>
        Parents or guardians who have questions about a child's data may contact{" "}
        <a href="mailto:accqudo@gmail.com">accqudo@gmail.com</a>.
      </p>

      <h2>10. Third-party links</h2>
      <p>
        Accqudo may link to third-party services. Their privacy practices are governed by their
        own policies. Review those policies before providing information to a third party.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        Accqudo may update this Privacy Policy when the service, technology or applicable legal
        requirements change. The updated version will be published on this page with a revised
        update date.
      </p>

      <h2>12. Contact</h2>
      <p>
        Privacy questions and requests can be sent to{" "}
        <a href="mailto:accqudo@gmail.com">accqudo@gmail.com</a>.
      </p>

      <div className="not-prose mt-8 border-l-4 border-[#A9791F] bg-[#EEF2ED] p-4 text-xs leading-relaxed text-[#4B5768]">
        This policy is written for the current Accqudo product information available to us and
        should be reviewed by qualified Indian privacy counsel before production publication,
        particularly for child-data, consent, retention, breach-response and DPDP compliance.
      </div>
    </InfoShell>
  );
}
