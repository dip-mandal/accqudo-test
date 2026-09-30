import { InfoShell } from "../_components/InfoShell";

export const metadata = {
  title: "Subscription Terms | Accqudo",
  description: "Accqudo terms for paid test-series and subscription access.",
};

export default function SubscriptionTermsPage() {
  return (
    <InfoShell title="Subscription Terms" eyebrow="Accqudo · Paid Access">
      <p>
        These Subscription Terms explain the rules that apply when you purchase a paid Accqudo
        test package or subscription.
      </p>

      <h2>1. What you purchase</h2>
      <p>
        Accqudo packages provide digital access to the tests, features and access period shown
        for the selected package at the time of purchase. The exact package price, validity
        period and included content are displayed on the Accqudo website.
      </p>

      <h2>2. Access begins after successful payment</h2>
      <p>
        Paid access is activated after Accqudo receives and verifies successful payment
        confirmation. If payment is unsuccessful or remains unconfirmed, premium access may not
        be activated.
      </p>

      <h2>3. Validity</h2>
      <p>
        Package access is available for the validity period displayed for that package. The
        account may retain historical attempt information after access expires, subject to
        applicable data-retention practices, but premium entitlements may end when the purchased
        access period ends.
      </p>

      <h2>4. Package contents</h2>
      <p>
        Package contents may include tests organised by exam, subject, chapter, topic or other
        categories supported by the Accqudo platform. The package description shown at purchase
        is the authoritative description of what is included in that package.
      </p>

      <h2>5. Recurring billing</h2>
      <p>
        Accqudo will not treat a one-time package as a recurring subscription unless recurring
        billing is clearly disclosed before purchase and the user completes the applicable
        recurring-payment authorization. If Accqudo offers auto-renewing plans in the future,
        the checkout will state the renewal amount, frequency, cancellation method and other
        material terms before authorization.
      </p>

      <h2>6. Cancellation</h2>
      <p>
        Where recurring billing is offered, users will be provided with a cancellation mechanism
        appropriate to the payment flow. Cancellation prevents future renewal according to the
        applicable plan terms; it does not necessarily reverse a period that has already begun.
      </p>

      <h2>7. Refunds</h2>
      <p>
        Refunds are handled under the{" "}
        <a href="/info/refund-policy">Refund & Cancellation Policy</a> and applicable law.
      </p>

      <h2>8. Account sharing</h2>
      <p>
        Paid access is intended for the account holder. Sharing credentials or attempting to
        provide unauthorized access to other people may result in security restrictions or
        suspension in accordance with the Terms of Use.
      </p>

      <h2>9. Content and feature changes</h2>
      <p>
        Accqudo may update, correct or improve tests, explanations, analytics and platform
        features. Changes will not be used to misrepresent the purchased package or remove
        rights that cannot lawfully be excluded.
      </p>

      <h2>10. Payment issues</h2>
      <p>
        If payment is debited but the package is not activated, contact{" "}
        <a href="mailto:accqudo@gmail.com">accqudo@gmail.com</a> with the payment reference.
        Accqudo will investigate the transaction and reconcile the payment status.
      </p>

      <h2>11. No examination guarantee</h2>
      <p>
        Buying an Accqudo package does not guarantee selection, admission, rank, percentile or
        any other result in an external examination. Accqudo is a preparation and practice
        platform.
      </p>

      <h2>12. Contact</h2>
      <p>
        Subscription support:{" "}
        <a href="mailto:accqudo@gmail.com">accqudo@gmail.com</a>.
      </p>

      <div className="not-prose mt-8 border-l-4 border-[#A9791F] bg-[#EEF2ED] p-4 text-xs leading-relaxed text-[#4B5768]">
        Your current homepage displays package validity and price from the live database. This
        page intentionally does not invent a renewal schedule because the supplied product code
        does not establish that your current packages are auto-renewing subscriptions.
      </div>
    </InfoShell>
  );
}
