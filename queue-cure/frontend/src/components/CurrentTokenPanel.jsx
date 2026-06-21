import { useState } from "react";
import TokenBoard from "./TokenBoard";
import { callNextPatient } from "../api/queueApi";
import { useToast } from "../hooks/useToast";
import { BellRingIcon } from "./icons";

export default function CurrentTokenPanel({ queueStatus, waitingCount }) {
  const [calling, setCalling] = useState(false);
  const { showToast } = useToast();

  const handleCallNext = async () => {
    setCalling(true);
    try {
      const result = await callNextPatient();
      showToast(`Now calling token #${result.currentToken}`, "success");
    } catch (err) {
      if (err.status === 409) {
        showToast("No patients in queue. Cannot call next patient.", "warning");
      } else {
        showToast(err.message || "Could not call next patient", "error");
      }
    } finally {
      setCalling(false);
    }
  };

  const hasCurrentPatient = queueStatus?.currentPatientName;

  return (
    <div className="rounded-xl bg-white border border-clinic-mintDeep p-5 flex flex-col gap-4">
      <h2 className="text-sm font-bold uppercase tracking-wide text-clinic-ink/60">Now Serving</h2>

      <TokenBoard
        label={hasCurrentPatient ? "Current Token" : "Queue Idle"}
        value={hasCurrentPatient ? `#${queueStatus.currentToken}` : "—"}
        accent="amber"
        size="md"
      />

      {hasCurrentPatient && (
        <p className="text-sm text-clinic-ink/70">
          Consulting <span className="font-semibold text-clinic-ink">{queueStatus.currentPatientName}</span>
        </p>
      )}

      <button
        onClick={handleCallNext}
        disabled={calling || waitingCount === 0}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-clinic-coral px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-clinic-coralDark disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <BellRingIcon className="w-4 h-4" />
        {calling ? "Calling…" : "Call Next Patient"}
      </button>

      {waitingCount === 0 && (
        <p className="text-xs text-center text-clinic-ink/40">No patients waiting to be called.</p>
      )}
    </div>
  );
}
