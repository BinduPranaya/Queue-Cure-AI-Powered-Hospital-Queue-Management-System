import LiveIndicator from "./LiveIndicator";
import { useQueue } from "../hooks/useQueue";
import BrandLogo from "./BrandLogo";
import { Link } from "react-router-dom";

export default function DashboardHeader() {
  const { connected } = useQueue();

  return (
    <header className="sticky top-0 z-30 border-b border-clinic-mintDeep bg-clinic-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          <BrandLogo />
          <div>
            <p className="text-xs text-clinic-ink/50 leading-tight">Receptionist Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xs font-bold text-clinic-ink/50 transition-colors hover:text-clinic-teal"
          >
            ← Home
          </Link>
          <LiveIndicator connected={connected} />
        </div>
      </div>
    </header>
  );
}
