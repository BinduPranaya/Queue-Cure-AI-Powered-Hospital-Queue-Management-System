import { useEffect, useRef, useState } from "react";

/**
 * AI wait-time prediction card for the patient token lookup screen.
 *
 * Shows the predicted wait as both a progress bar (elapsed vs. total
 * predicted minutes) and a live countdown timer. The countdown ticks
 * down locally between predictions; whenever a fresh prediction arrives
 * (via re-fetch on a queue event) it resets to the new value so it never
 * drifts far from the model's latest estimate.
 */
export default function PredictionCard({ prediction }) {
  const [secondsLeft, setSecondsLeft] = useState(() => (prediction?.predictedWaitTime ?? 0) * 60);
  const lastPredictionKey = useRef(null);

  useEffect(() => {
    if (!prediction) return;
    const key = `${prediction.predictedWaitTime}-${prediction.tokenNumber}`;
    // Only reset the countdown when the underlying prediction value
    // actually changes (a new model call), not on every parent re-render.
    if (lastPredictionKey.current !== key) {
      lastPredictionKey.current = key;
      setSecondsLeft(prediction.predictedWaitTime * 60);
    }
  }, [prediction]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!prediction) return null;

  const totalSeconds = Math.max(1, prediction.predictedWaitTime * 60);
  const elapsedFraction = 1 - secondsLeft / totalSeconds;
  const progressPercent = Math.min(100, Math.max(0, elapsedFraction * 100));

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const confidencePercent =
    prediction.confidence != null ? Math.round(prediction.confidence) : null;

  return (
    <div className="rounded-xl bg-white/5 border border-white/10 px-5 py-5 space-y-4 animate-flicker-in">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-clinic-mint/50">
          AI Wait Prediction
        </p>
        {confidencePercent != null && (
          <span className="rounded-full bg-clinic-amber/15 px-2.5 py-1 text-xs font-bold text-clinic-amber">
            {confidencePercent}% confidence
          </span>
        )}
      </div>

      <div className="text-center">
        <p className="font-mono text-4xl font-bold text-clinic-amber tabular">
          {minutes}:{String(seconds).padStart(2, "0")}
        </p>
        <p className="text-xs text-clinic-mint/50 mt-1">estimated time remaining</p>
      </div>

      <div className="space-y-1.5">
        <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-clinic-amber transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[0.65rem] text-clinic-mint/40">
          <span>Now</span>
          <span>~{prediction.predictedWaitTime} min total</span>
        </div>
      </div>

      {prediction.source === "fallback-formula" && (
        <p className="text-[0.65rem] text-clinic-mint/40 text-center">
          Using standard estimate (AI service unavailable)
        </p>
      )}
    </div>
  );
}
