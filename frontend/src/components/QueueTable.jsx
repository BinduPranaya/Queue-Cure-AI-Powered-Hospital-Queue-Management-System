import { useState } from "react";
import { removePatient } from "../api/queueApi";
import { useToast } from "../hooks/useToast";
import { TrashIcon, EmptyQueueIcon } from "./icons";

const statusStyles = {
  WAITING: "bg-clinic-amber/15 text-amber-800",
  CURRENT: "bg-clinic-coral/15 text-clinic-coralDark",
  COMPLETED: "bg-clinic-teal/10 text-clinic-teal",
  CANCELLED: "bg-clinic-ink/10 text-clinic-ink/50",
};

export default function QueueTable({ patients, loading }) {
  const [removingId, setRemovingId] = useState(null);
  const { showToast } = useToast();

  const handleRemove = async (patient) => {
    setRemovingId(patient.id);
    try {
      await removePatient(patient.id);
      showToast(`Token #${patient.tokenNumber} removed from queue`, "info");
    } catch (err) {
      showToast(err.message || "Could not remove patient", "error");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl bg-white border border-clinic-mintDeep p-10 flex items-center justify-center">
        <p className="text-sm text-clinic-ink/50 animate-pulse">Loading queue…</p>
      </div>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-clinic-mintDeep p-10 flex flex-col items-center justify-center text-center">
        <EmptyQueueIcon className="w-14 h-14 text-clinic-mintDeep mb-3" />
        <p className="font-semibold text-clinic-ink">No Patients In Queue</p>
        <p className="text-sm text-clinic-ink/50 mt-1">Add a patient above to start the queue.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white border border-clinic-mintDeep overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-clinic-mintDeep bg-clinic-mint/40 text-left text-xs font-semibold uppercase tracking-wide text-clinic-ink/50">
              <th className="px-5 py-3">Token</th>
              <th className="px-5 py-3">Patient Name</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Est. Wait</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="border-b border-clinic-mintDeep last:border-0 animate-slide-up">
                <td className="px-5 py-3 font-mono font-bold text-clinic-teal tabular">#{p.tokenNumber}</td>
                <td className="px-5 py-3 text-clinic-ink font-medium">{p.patientName}</td>
                <td className="px-5 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[p.status]}`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-clinic-ink/70 tabular">
                  {p.estimatedWaitMinutes != null ? `${p.estimatedWaitMinutes} min` : "—"}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    onClick={() => handleRemove(p)}
                    disabled={removingId === p.id}
                    aria-label={`Remove token ${p.tokenNumber}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-clinic-coralDark hover:bg-clinic-coral/10 transition-colors disabled:opacity-50"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    {removingId === p.id ? "Removing…" : "Remove"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
