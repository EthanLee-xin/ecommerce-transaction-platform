import Link from "next/link";

const steps = [
  { key: "step1", label: "Sign In", href: "/login" },
  { key: "step2", label: "Shipping", href: "/shipping" },
  { key: "step3", label: "Payment", href: "/payment" },
  { key: "step4", label: "Place Order", href: "/placeorder" },
];

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  const activeSteps = { step1, step2, step3, step4 };

  return (
    <section className="mx-auto w-full max-w-4xl">
      <ol className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-4">
        {/* <ol className="grid gap-10 rounded-2xl  p-3 sm:grid-cols-4 color"> */}
        {steps.map((step, index) => {
          const active = activeSteps[step.key];

          const className = active
            ? "flex items-center gap-3 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm"
            : "flex items-center gap-3 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-400";

          const content = (
            <>
              <span
                className={
                  active
                    ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-sm"
                    : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm text-slate-400"
                }
              >
                {index + 1}
              </span>
              <span className="truncate">{step.label}</span>
            </>
          );

          return (
            <li key={step.key}>
              {active ? (
                <Link href={step.href} className={className}>
                  {content}
                </Link>
              ) : (
                <span className={className}>{content}</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default CheckoutSteps;
