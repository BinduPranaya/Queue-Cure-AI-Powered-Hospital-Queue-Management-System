import { useState } from "react";
import { updateConsultationTime } from "../api/queueApi";
import { useToast } from "../hooks/useToast";
import { SettingsIcon } from "./icons";

export default function SettingsPanel({ averageConsultationTime }) {
  // We only show the server's value until the receptionist starts typing.
  // Once they touch the field, their input takes over until they save -
  // this avoids needing an effect to sync state from props.
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const displayValue = draft ?? averageConsultationTime ?? 10;

  const handleSave = async (e) => {
    e.preventDefault();
    const numeric = Number(displayValue);
    if (!Number.isFinite(numeric) || numeric < 1 || numeric > 240) {
      showToast("Enter a time between 1 and 240 minutes", "warning");
      return;
    }

    setSaving(true);
    try {
      await updateConsultationTime(numeric);
      showToast("Average consultation time updated. Wait times recalculated.", "success");
      setDraft(null); // resume following the server value
    } catch (err) {
      showToast(err.message || "Could not update setting", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="rounded-xl bg-white border border-clinic-mintDeep p-5">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-clinic-ink/60 mb-3">
        <SettingsIcon className="w-4 h-4" />
        Settings
      </h2>
      <label className="block text-xs font-medium text-clinic-ink/60 mb-1.5" htmlFor="avgTime">
        Average consultation time (minutes)
      </label>
      <div className="flex gap-3">
        <input
          id="avgTime"
          type="number"
          min={1}
          max={240}
          value={displayValue}
          onChange={(e) => setDraft(e.target.value)}
          disabled={saving}
          className="w-28 rounded-lg border border-clinic-mintDeep bg-clinic-paper px-3 py-2 text-sm font-mono tabular text-clinic-ink focus:outline-none focus:ring-2 focus:ring-clinic-teal/40 focus:border-clinic-teal disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-clinic-ink px-4 py-2 text-sm font-semibold text-white hover:bg-clinic-tealDark transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      <p className="text-xs text-clinic-ink/40 mt-2">
        Changing this recalculates every waiting patient's estimated wait time immediately.
      </p>
    </form>
  );
}
