export default function BrandLogo({ dark = false, compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          dark ? "bg-clinic-mint text-clinic-tealDark" : "bg-clinic-teal text-clinic-mint"
        }`}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="2.2">
          <path d="M16 26S5.5 20.2 5.5 12.5a5 5 0 0 1 9-3 5 5 0 0 1 9 3C23.5 20.2 16 26 16 26Z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 15h3l1.5-3 2.5 6 1.5-3H22" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {!compact && (
        <span className={`font-display text-sm font-bold tracking-tight ${dark ? "text-clinic-mint" : "text-clinic-tealDark"}`}>
          CAREQUEUE <span className="text-clinic-coral">AI</span>
        </span>
      )}
    </div>
  );
}
