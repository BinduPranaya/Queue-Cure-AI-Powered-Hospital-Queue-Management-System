import { Link } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import StatCard from "../components/StatCard";
import AddPatientForm from "../components/AddPatientForm";
import QueueTable from "../components/QueueTable";
import CurrentTokenPanel from "../components/CurrentTokenPanel";
import SettingsPanel from "../components/SettingsPanel";
import AnalyticsSection from "../components/AnalyticsSection";
import AiAnalyticsSection from "../components/AiAnalyticsSection";
import { useQueue } from "../hooks/useQueue";
import { TokenIcon, UsersIcon, CheckCircleIcon, ClockIcon, ChevronRightIcon } from "../components/icons";

export default function ReceptionistDashboard() {
  const { queueStatus, waitingPatients, loading, error } = useQueue();

  return (
    <div className="min-h-screen bg-clinic-mint">
      <DashboardHeader />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 space-y-6">
        {error && (
          <div className="rounded-xl bg-clinic-coral/10 border border-clinic-coral/30 px-4 py-3 text-sm text-clinic-coralDark">
            {error}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            label="Current Token"
            value={queueStatus ? `#${queueStatus.currentToken}` : "—"}
            icon={<TokenIcon />}
            accent="teal"
          />
          <StatCard
            label="Waiting Patients"
            value={queueStatus?.waitingCount ?? 0}
            icon={<UsersIcon />}
            accent="amber"
          />
          <StatCard
            label="Completed Patients"
            value={queueStatus?.completedCount ?? 0}
            icon={<CheckCircleIcon />}
            accent="teal"
          />
          <StatCard
            label="Avg. Consultation"
            value={queueStatus?.averageConsultationTime ?? 0}
            suffix="min"
            icon={<ClockIcon />}
            accent="coral"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: queue management */}
          <div className="lg:col-span-2 space-y-6">
            <AddPatientForm />
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-clinic-ink/60 mb-3">Waiting Queue</h2>
              <QueueTable patients={waitingPatients} loading={loading} />
            </div>
          </div>

          {/* Right: current token, settings, link to patient view */}
          <div className="space-y-6">
            <CurrentTokenPanel queueStatus={queueStatus} waitingCount={waitingPatients.length} />
            <SettingsPanel averageConsultationTime={queueStatus?.averageConsultationTime} />
            <Link
              to="/waiting-room"
              className="flex items-center justify-between rounded-xl bg-clinic-teal px-5 py-4 text-sm font-semibold text-white hover:bg-clinic-tealLight transition-colors"
            >
              View Patient Waiting Room
              <ChevronRightIcon />
            </Link>
          </div>
        </div>

        <AnalyticsSection />
        <AiAnalyticsSection />
      </main>
    </div>
  );
}
