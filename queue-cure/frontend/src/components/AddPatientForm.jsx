import { useState } from "react";
import { addPatient } from "../api/queueApi";
import { useToast } from "../hooks/useToast";
import { PlusIcon } from "./icons";

export default function AddPatientForm({ onAdded }) {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      showToast("Enter a name with at least 2 characters", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const result = await addPatient(trimmed);
      showToast(`Token #${result.tokenNumber} issued to ${trimmed}`, "success");
      setName("");
      onAdded?.(result);
    } catch (err) {
      showToast(err.message || "Could not add patient", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-white border border-clinic-mintDeep p-5">
      <h2 className="text-sm font-bold uppercase tracking-wide text-clinic-ink/60 mb-3">Add Patient</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Patient's full name"
          maxLength={150}
          disabled={submitting}
          className="flex-1 rounded-lg border border-clinic-mintDeep bg-clinic-paper px-4 py-2.5 text-sm text-clinic-ink placeholder:text-clinic-ink/40 focus:outline-none focus:ring-2 focus:ring-clinic-teal/40 focus:border-clinic-teal disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-clinic-teal px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clinic-tealLight disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <PlusIcon className="w-4 h-4" />
          {submitting ? "Adding…" : "Add to Queue"}
        </button>
      </div>
    </form>
  );
}
