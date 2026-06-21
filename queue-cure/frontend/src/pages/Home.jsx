import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-clinic-mint flex flex-col items-center justify-center px-4 gap-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-clinic-teal font-display font-bold text-2xl text-clinic-mint">
          QC
        </div>
        <h1 className="font-sans text-3xl font-extrabold text-clinic-ink">Queue Cure</h1>
        <p className="text-sm text-clinic-ink/60 mt-1">Real-time clinic queue management</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 w-full max-w-lg">
        <Link
          to="/dashboard"
          className="rounded-xl bg-white border border-clinic-mintDeep p-6 text-center hover:shadow-md hover:border-clinic-teal/40 transition-all"
        >
          <p className="font-bold text-clinic-ink">Receptionist</p>
          <p className="text-sm text-clinic-ink/50 mt-1">Manage the queue</p>
        </Link>
        <Link
          to="/waiting-room"
          className="rounded-xl bg-clinic-tealDark p-6 text-center hover:shadow-md transition-all"
        >
          <p className="font-bold text-clinic-mint">Patient</p>
          <p className="text-sm text-clinic-mint/50 mt-1">View live queue</p>
        </Link>
      </div>
    </div>
  );
}
