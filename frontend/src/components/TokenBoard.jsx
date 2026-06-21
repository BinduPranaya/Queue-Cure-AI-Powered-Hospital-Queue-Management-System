/**
 * TokenBoard — the signature visual element of Queue Cure.
 *
 * Modeled after the illuminated LED token displays found at real clinics,
 * banks, and government offices in India. Renders a large digital-style
 * number against a dark teal "board", with a small label above it.
 * Used consistently across the receptionist dashboard and the patient
 * waiting room so both screens share one unmistakable visual identity.
 */
export default function TokenBoard({ label, value, accent = "mint", size = "lg", pulse = false }) {
  const sizeClasses = {
    lg: "text-[5.5rem] sm:text-[7rem] leading-none",
    md: "text-5xl sm:text-6xl leading-none",
    sm: "text-3xl leading-none",
  };

  const accentClasses = {
    mint: "text-clinic-mint",
    coral: "text-clinic-coral",
    amber: "text-clinic-amber",
  };

  return (
    <div className="relative rounded-2xl bg-clinic-tealDark px-6 py-5 shadow-token overflow-hidden">
      {/* subtle scanline texture to sell the "LED board" feel */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)",
        }}
      />
      <p className="relative font-sans text-[0.65rem] sm:text-xs font-semibold uppercase tracking-[0.18em] text-clinic-mint/60 mb-1">
        {label}
      </p>
      <p
        className={`relative font-display font-bold tabular ${sizeClasses[size]} ${accentClasses[accent]} ${
          pulse ? "animate-pulse-slow" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
