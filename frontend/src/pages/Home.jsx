import { Link } from "react-router-dom";
import { BellRingIcon, ChevronRightIcon, ClockIcon, TokenIcon } from "../components/icons";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-clinic-paper text-clinic-ink">
      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link to="/" className="flex items-center gap-3" aria-label="Queue Cure home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-clinic-teal font-display text-sm font-bold text-clinic-mint shadow-token">
            QC
          </span>
          <span className="font-display text-sm font-bold tracking-tight text-clinic-tealDark">QUEUE CURE</span>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/waiting-room/my-token" className="hidden font-semibold text-clinic-ink/60 transition-colors hover:text-clinic-teal sm:block">
            Check a token
          </Link>
          <Link
            to="/dashboard"
            className="rounded-full border border-clinic-teal/15 bg-white px-4 py-2 font-bold text-clinic-teal transition hover:border-clinic-teal/40 hover:shadow-sm"
          >
            Staff sign in
          </Link>
        </div>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:pb-28 lg:pt-20">
          <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-clinic-mint blur-3xl" />
          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-clinic-teal/10 bg-clinic-mint px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-clinic-teal">
              <span className="h-2 w-2 animate-pulse rounded-full bg-clinic-coral" />
              A calmer clinic experience
            </div>
            <h1 className="max-w-3xl font-sans text-5xl font-extrabold leading-[1.02] tracking-[-0.06em] text-clinic-tealDark sm:text-6xl lg:text-7xl">
              Less waiting.
              <br />
              <span className="text-clinic-coral">More caring.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-clinic-ink/60 sm:text-lg">
              Queue Cure makes every clinic visit feel more predictable. Follow the live queue,
              get smarter wait-time estimates, and keep your team moving.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/waiting-room"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-clinic-teal px-5 py-3.5 text-sm font-bold text-clinic-mint shadow-token transition hover:-translate-y-0.5 hover:bg-clinic-tealLight"
              >
                View live queue
                <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-xl border border-clinic-teal/15 bg-white px-5 py-3.5 text-sm font-bold text-clinic-teal transition hover:border-clinic-teal/40 hover:shadow-sm"
              >
                Open staff dashboard
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-semibold text-clinic-ink/45">
              <span className="flex items-center gap-2"><ClockIcon className="h-4 w-4 text-clinic-teal" /> Live wait updates</span>
              <span className="flex items-center gap-2"><BellRingIcon className="h-4 w-4 text-clinic-teal" /> Timely notifications</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:ml-auto">
            <div className="absolute -right-5 -top-5 h-28 w-28 rounded-full bg-clinic-amber/25 blur-2xl" />
            <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-clinic-coral/15 blur-3xl" />
            <div className="relative rounded-[2rem] bg-clinic-tealDark p-3 shadow-[0_24px_70px_-20px_rgba(10,53,48,0.55)]">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-6 sm:p-8">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-clinic-mint/50">
                  <span>Live queue</span>
                  <span className="flex items-center gap-1.5 text-clinic-mint"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Active</span>
                </div>
                <div className="mt-10 flex items-end justify-between">
                  <div>
                    <p className="text-sm font-semibold text-clinic-mint/55">Currently serving</p>
                    <p className="mt-2 font-display text-6xl font-bold tracking-tight text-clinic-mint">A<span className="text-clinic-amber">24</span></p>
                  </div>
                  <TokenIcon className="mb-2 h-12 w-12 text-clinic-amber" />
                </div>
                <div className="mt-10 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/[0.07] p-4">
                    <p className="font-display text-2xl font-bold text-clinic-mint">08</p>
                    <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-wider text-clinic-mint/40">People waiting</p>
                  </div>
                  <div className="rounded-xl bg-clinic-amber p-4">
                    <p className="font-display text-2xl font-bold text-clinic-ink">18m</p>
                    <p className="mt-1 text-[0.65rem] font-bold uppercase tracking-wider text-clinic-ink/55">Estimated wait</p>
                  </div>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[68%] rounded-full bg-clinic-coral" />
                </div>
                <p className="mt-3 text-center text-xs text-clinic-mint/40">Updated just now</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-clinic-teal/10 bg-clinic-mint/45">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-12 sm:grid-cols-3 sm:px-8 lg:px-12">
            <Feature icon={<TokenIcon className="h-5 w-5" />} title="One clear view" text="See the current token and your place in line at a glance." />
            <Feature icon={<ClockIcon className="h-5 w-5" />} title="Smarter estimates" text="AI-powered predictions help patients plan their time." />
            <Feature icon={<BellRingIcon className="h-5 w-5" />} title="Stay in control" text="Simple tools help staff keep the queue flowing smoothly." />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
          <div className="rounded-3xl bg-clinic-coral px-6 py-10 sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-14">
            <div>
              <p className="font-display text-xs font-bold uppercase tracking-[0.18em] text-clinic-ink/55">Ready when you are</p>
              <h2 className="mt-3 max-w-xl text-3xl font-extrabold tracking-tight text-clinic-ink sm:text-4xl">Your next visit just got easier.</h2>
            </div>
            <Link to="/waiting-room" className="mt-7 inline-flex items-center justify-center rounded-xl bg-clinic-ink px-5 py-3.5 text-sm font-bold text-white transition hover:bg-clinic-tealDark lg:mt-0">
              Enter the waiting room <ChevronRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-clinic-teal/10 px-5 py-6 text-xs text-clinic-ink/45 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <span className="font-display font-bold text-clinic-teal">QUEUE CURE</span>
        <span>Better queues, better care.</span>
      </footer>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="flex gap-4 rounded-2xl bg-white/65 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-clinic-teal text-clinic-mint">{icon}</div>
      <div>
        <h3 className="font-bold text-clinic-tealDark">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-clinic-ink/55">{text}</p>
      </div>
    </div>
  );
}
