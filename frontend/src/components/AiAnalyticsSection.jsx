import { useEffect, useState } from "react";
import { getPredictionAnalytics } from "../api/queueApi";
import { useQueue } from "../hooks/useQueue";

/**
 * Lightweight admin stats for the AI wait-time prediction feature:
 * average predicted wait, today's peak hour, and a basic per-doctor
 * breakdown. No charts - just numbers, per the current scope.
 */
export default function AiAnalyticsSection() {
  const [analytics, setAnalytics] = useState(null);
  const { lastEvent } = useQueue();

  useEffect(() => {
    getPredictionAnalytics().then(setAnalytics).catch(() => {});
  }, [lastEvent]);

  // No predictions logged yet (e.g. no one has checked their token) -
  // nothing meaningful to show.
  if (!analytics || analytics.doctorStats.length === 0) return null;

  return (
    <div className="rounded-xl bg-white border border-clinic-mintDeep p-5">
      <h2 className="text-sm font-bold uppercase tracking-wide text-clinic-ink/60 mb-4">
        AI Prediction Insights
      </h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-lg bg-clinic-amber/10 px-3 py-3 text-center">
          <p className="font-mono text-xl font-bold text-amber-700 tabular">
            {analytics.averagePredictedWaitMinutes} min
          </p>
          <p className="text-[0.65rem] mt-1 font-medium uppercase tracking-wide text-clinic-ink/50">
            Avg. Predicted Wait
          </p>
        </div>
        <div className="rounded-lg bg-clinic-amber/10 px-3 py-3 text-center">
          <p className="font-mono text-xl font-bold text-amber-700 tabular">
            {analytics.peakHour != null ? formatHour(analytics.peakHour) : "—"}
          </p>
          <p className="text-[0.65rem] mt-1 font-medium uppercase tracking-wide text-clinic-ink/50">
            Peak Hour Today
          </p>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-clinic-ink/40 mb-2">
        Doctor Performance
      </p>
      <div className="divide-y divide-clinic-mintDeep">
        {analytics.doctorStats.map((doc) => (
          <div key={doc.doctorId ?? "general"} className="flex items-center justify-between py-2 text-sm">
            <div>
              <p className="font-medium text-clinic-ink">{doc.doctorName}</p>
              <p className="text-xs text-clinic-ink/50">{doc.department}</p>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-clinic-teal tabular">
                {doc.averagePredictedWaitMinutes} min
              </p>
              <p className="text-xs text-clinic-ink/40">{doc.predictionsLogged} predictions</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatHour(hour24) {
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12} ${period}`;
}
