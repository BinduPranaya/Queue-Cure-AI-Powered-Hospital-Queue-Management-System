/**
 * A single statistics card for the receptionist dashboard
 * (Current Token, Waiting Patients, Completed Patients, Average Time).
 */
export default function StatCard({ label, value, suffix, icon, accent = "teal" }) {
  const accentClasses = {
    teal: "text-clinic-teal bg-clinic-teal/10",
    coral: "text-clinic-coralDark bg-clinic-coral/10",
    amber: "text-amber-700 bg-clinic-amber/15",
  };

  return (
    <div className="rounded-xl bg-white border border-clinic-mintDeep px-5 py-4 flex items-center gap-4 transition-shadow hover:shadow-md">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${accentClasses[accent]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-clinic-ink/50">{label}</p>
        <p className="mt-0.5 font-mono text-2xl font-bold text-clinic-ink tabular">
          {value}
          {suffix && <span className="ml-1 text-sm font-medium text-clinic-ink/50">{suffix}</span>}
        </p>
      </div>
    </div>
  );
}
