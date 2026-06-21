import { Link } from "react-router-dom";
import { useQueue } from "../hooks/useQueue";
import TokenBoard from "../components/TokenBoard";

export default function PatientWaitingRoom() {
  const { queueStatus, loading, connected } = useQueue();

  return (
    <div className="min-h-screen bg-clinic-tealDark flex flex-col">
      <header className="flex items-center justify-between px-5 sm:px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-clinic-mint font-display font-bold text-clinic-tealDark text-sm">
            QC
          </div>
          <span className="font-sans font-bold text-clinic-mint">Queue Cure</span>
        </div>
        <LiveIndicatorDark connected={connected} />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-8">
        {loading ? (
          <p className="text-clinic-mint/60 animate-pulse">Loading queue…</p>
        ) : (
          <>
            <div className="w-full max-w-xs sm:max-w-sm">
              <TokenBoard label="Now Serving" value={`#${queueStatus?.currentToken ?? 0}`} accent="amber" size="lg" pulse />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
              <StatTile label="Waiting Ahead" value={queueStatus?.waitingCount ?? 0} />
              <StatTile label="Avg. Consultation" value={`${queueStatus?.averageConsultationTime ?? 0} min`} />
            </div>

            <Link
              to="/waiting-room/my-token"
              className="text-sm font-semibold text-clinic-mint underline underline-offset-4 hover:text-clinic-amber transition-colors"
            >
              Check my token &amp; estimated wait →
            </Link>
          </>
        )}
      </main>

      <footer className="text-center pb-6">
        <p className="text-xs text-clinic-mint/30">Please wait for your token number to be displayed above.</p>
      </footer>
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 px-5 py-4 text-center">
      <p className="font-mono text-2xl font-bold text-clinic-mint tabular">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-clinic-mint/50 mt-1">{label}</p>
    </div>
  );
}

function LiveIndicatorDark({ connected }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
        connected ? "bg-clinic-mint/10 text-clinic-mint" : "bg-clinic-coral/20 text-clinic-coral"
      }`}
    >
      <span className="relative flex h-2 w-2">
        {connected && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clinic-mint opacity-60" />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${connected ? "bg-clinic-mint" : "bg-clinic-coral"}`} />
      </span>
      {connected ? "Live Queue Connected" : "Reconnecting…"}
    </div>
  );
}
