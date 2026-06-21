/**
 * Shows whether the live WebSocket connection is active. Used on the
 * patient waiting room ("Live Queue Connected") and quietly in the
 * dashboard header.
 */
export default function LiveIndicator({ connected }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
        connected
          ? "bg-clinic-teal/10 text-clinic-teal"
          : "bg-clinic-coral/10 text-clinic-coralDark"
      }`}
    >
      <span className="relative flex h-2 w-2">
        {connected && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clinic-teal opacity-60" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            connected ? "bg-clinic-teal" : "bg-clinic-coral"
          }`}
        />
      </span>
      {connected ? "Live Queue Connected" : "Reconnecting…"}
    </div>
  );
}
