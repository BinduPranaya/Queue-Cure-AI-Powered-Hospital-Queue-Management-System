import { useEffect, useState } from "react";
import { getQueueAnalytics } from "../api/queueApi";
import { useQueue } from "../hooks/useQueue";

export default function AnalyticsSection() {
  const [analytics, setAnalytics] = useState(null);
  const { lastEvent } = useQueue();

  useEffect(() => {
    getQueueAnalytics().then(setAnalytics).catch(() => {});
  }, [lastEvent]);

  if (!analytics) return null;

  const items = [
    { label: "Total Patients Today", value: analytics.totalPatientsToday },
    { label: "Completed Patients", value: analytics.completedPatientsToday },
    { label: "Patients Waiting", value: analytics.patientsWaiting },
    { label: "Avg. Wait Time", value: `${analytics.averageWaitTimeMinutes} min` },
    { label: "Queue Efficiency", value: `${analytics.queueEfficiencyPercentage}%` },
  ];

  return (
    <div className="rounded-xl bg-white border border-clinic-mintDeep p-5">
      <h2 className="text-sm font-bold uppercase tracking-wide text-clinic-ink/60 mb-4">Today's Analytics</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg bg-clinic-mint/40 px-3 py-3 text-center">
            <p className="font-mono text-xl font-bold text-clinic-teal tabular">{item.value}</p>
            <p className="text-[0.65rem] mt-1 font-medium uppercase tracking-wide text-clinic-ink/50 leading-tight">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
