import { InfoShell } from "../_components/InfoShell";

export const metadata = {
  title: "Refund Policy | Accqudo",
  description: "Accqudo refund and cancellation policy for digital test-series access.",
};

export default function RefundPolicyPage() {
  return (
    <InfoShell title="Refund & Cancellation Policy" eyebrow="Accqudo · Refunds">
      <p>
        This policy explains how Accqudo handles cancellations, refunds and payment issues for
        digital test-series and subscription access.
      </p>

      <h2>1. Digital service</h2>
      <p>
        Accqudo provides digital access to online tests, mock tests, test series, results and
        related features. Access is delivered electronically to the user's account rather than
        through physical shipment.
      </p>

      <h2>2. Before purchasing</h2>
      <p>
        Please review the package name, included features, access duration, price and any
        applicable taxes displayed at checkout before completing payment.
      </p>

      <h2>3. Cancellation</h2>
      <p>
        If a plan provides a cancellation option, cancellation will be handled according to the
        plan terms shown at the time of purchase. Cancellation of access does not automatically
        mean that a payment is refundable.
      </p>

      <h2>4. Refund requests</h2>
      <p>
        Refund requests should be sent to{" "}
        <a href="mailto:accqudo@gmail.com">accqudo@gmail.com</a> using the email address
        associated with the Accqudo account. Include the account email, order/payment reference
        if available, package purchased and a short description of the issue.
      </p>

      <h2>5. Situations requiring review</h2>
      <p>
        Accqudo will review refund requests individually, including cases such as duplicate
        payments, payment captured but access not activated, material technical failure that
        prevents the purchased service from being delivered, or another circumstance where a
        refund is required by applicable law or the applicable purchase terms.
      </p>

      <h2>6. Service not as described</h2>
      <p>
        If the purchased digital service is materially different from the features or access
        conditions represented at purchase, contact support promptly so the issue can be
        investigated and an appropriate remedy can be considered.
      </p>

      <h2>7. Refund processing</h2>
      <p>
        When a refund is approved, the refund will normally be initiated through the original
        payment method or the payment provider's supported refund process. The time for the
        amount to appear can depend on the payment provider and banking system.
      </p>

      <h2>8. Failed or reversed payments</h2>
      <p>
        A failed, reversed or incomplete payment should not by itself be treated as a successful
        subscription. If money was debited but Accqudo did not receive a successful payment
        confirmation, contact support with the payment reference so the transaction can be
        reconciled.
      </p>

      <h2>9. Abuse and fraudulent transactions</h2>
      <p>
        Refund handling may be subject to verification where there is suspected payment fraud,
        account abuse, deliberate misuse of the service or repeated chargeback activity. This
        does not limit rights that cannot lawfully be excluded.
      </p>

      <h2>10. Changes</h2>
      <p>
        Accqudo may update this policy when the product, payment methods or applicable legal
        requirements change. The version published at the time of purchase will be relevant to
        that purchase, subject to applicable law.
      </p>

      <h2>11. Contact</h2>
      <p>
        Refund and payment support:{" "}
        <a href="mailto:accqudo@gmail.com">accqudo@gmail.com</a>.
      </p>

      <div className="not-prose mt-8 border-l-4 border-[#A9791F] bg-[#EEF2ED] p-4 text-xs leading-relaxed text-[#4B5768]">
        This is a conservative product-level policy. Before enabling paid subscriptions at
        scale, have an Indian consumer-law professional review the final eligibility rules,
        cancellation process and statutory requirements for your exact payment model.
      </div>
    </InfoShell>
  );
}
