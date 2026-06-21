import LiveIndicator from "./LiveIndicator";
import { useQueue } from "../hooks/useQueue";

export default function DashboardHeader() {
  const { connected } = useQueue();

  return (
    <header className="sticky top-0 z-30 border-b border-clinic-mintDeep bg-clinic-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-clinic-teal font-display font-bold text-clinic-mint">
            QC
          </div>
          <div>
            <h1 className="font-sans text-lg font-extrabold text-clinic-ink leading-tight">Queue Cure</h1>
            <p className="text-xs text-clinic-ink/50 leading-tight">Receptionist Dashboard</p>
          </div>
        </div>
        <LiveIndicator connected={connected} />
      </div>
    </header>
  );
}
