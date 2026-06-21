import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPatientByToken } from "../api/queueApi";
import { useQueue } from "../hooks/useQueue";
import TokenBoard from "../components/TokenBoard";

export default function MyTokenLookup() {
  const [tokenInput, setTokenInput] = useState("");
  const [patient, setPatient] = useState(null);
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const { queueStatus, lastEvent } = useQueue();

  const handleSearch = async (e) => {
    e.preventDefault();
    const token = Number(tokenInput);
    if (!Number.isInteger(token) || token <= 0) return;

    setSearching(true);
    setNotFound(false);
    try {
      const result = await getPatientByToken(token);
      setPatient(result);
    } catch {
      setPatient(null);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  // Re-fetch automatically whenever a queue event happens, so the ETA
  // stays live without the patient needing to re-search.
  useEffect(() => {
    if (!patient) return;
    getPatientByToken(patient.tokenNumber)
      .then(setPatient)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastEvent]);

  return (
    <div className="min-h-screen bg-clinic-tealDark flex flex-col items-center px-4 py-8 gap-6">
      <div className="w-full max-w-sm flex items-center justify-between">
        <Link to="/waiting-room" className="text-sm font-semibold text-clinic-mint/70 hover:text-clinic-mint">
          ← Back
        </Link>
        <span className="text-sm font-bold text-clinic-mint">Queue Cure</span>
      </div>

      <form onSubmit={handleSearch} className="w-full max-w-sm flex gap-2">
        <input
          type="number"
          min={1}
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          placeholder="Enter your token number"
          className="flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-clinic-mint placeholder:text-clinic-mint/40 focus:outline-none focus:ring-2 focus:ring-clinic-amber/50"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-lg bg-clinic-amber px-5 py-2.5 text-sm font-bold text-clinic-ink hover:bg-clinic-amber/90 transition-colors disabled:opacity-60"
        >
          {searching ? "…" : "Check"}
        </button>
      </form>

      {notFound && (
        <p className="text-sm text-clinic-coral">No patient found with that token number.</p>
      )}

      {patient && (
        <div className="w-full max-w-sm space-y-4 animate-flicker-in">
          <TokenBoard label="Your Token" value={`#${patient.tokenNumber}`} accent="mint" size="md" />

          <div className="grid grid-cols-2 gap-3">
            <MiniStat label="Status" value={patient.status} />
            <MiniStat
              label="Tokens Ahead"
              value={patient.status === "WAITING" ? patient.tokensAhead : "—"}
            />
          </div>

          <div className="rounded-xl bg-white/5 border border-white/10 px-5 py-4 text-center">
            <p className="font-mono text-3xl font-bold text-clinic-amber tabular">
              {patient.status === "WAITING" ? `${patient.estimatedWaitMinutes} min` : "—"}
            </p>
            <p className="text-xs font-medium uppercase tracking-wide text-clinic-mint/50 mt-1">
              Estimated Waiting Time
            </p>
          </div>

          <p className="text-center text-xs text-clinic-mint/40">
            Currently serving token #{queueStatus?.currentToken ?? 0}
          </p>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-center">
      <p className="font-mono text-lg font-bold text-clinic-mint tabular">{value}</p>
      <p className="text-[0.65rem] font-medium uppercase tracking-wide text-clinic-mint/50 mt-1">{label}</p>
    </div>
  );
}
