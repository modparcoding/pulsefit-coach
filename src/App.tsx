import { Link, Route, Routes } from "react-router-dom";

const navItems = [
  { href: "/", label: "Today" },
  { href: "/progress", label: "Progress" },
  { href: "/library", label: "Library" },
  { href: "/settings", label: "Settings" },
];

export default function App() {
  return (
    <div className="min-h-dvh bg-stone-50 text-stone-950">
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-24 pt-5">
        <Routes>
          <Route path="/" element={<TodayScreen />} />
          <Route path="/progress" element={<PlaceholderScreen title="Progress" />} />
          <Route path="/library" element={<PlaceholderScreen title="Exercise Library" />} />
          <Route path="/settings" element={<PlaceholderScreen title="Settings" />} />
        </Routes>
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white/92 px-3 py-3 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-2">
          {navItems.map((item) => (
            <Link
              className="rounded-lg px-2 py-3 text-center text-sm font-bold text-stone-600 hover:bg-emerald-50 hover:text-emerald-900"
              key={item.href}
              to={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

function TodayScreen() {
  return (
    <section className="flex flex-1 flex-col gap-5">
      <header className="space-y-2">
        <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
          Fitness Coach MVP
        </p>
        <h1 className="text-4xl font-black leading-tight">Your trainer should remember.</h1>
        <p className="text-base leading-7 text-stone-600">
          This rebuild starts with the real foundation: typed training data, a repository layer, and
          room for guided workouts with weight and rep progression.
        </p>
      </header>

      <article className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
        <img
          alt="Athlete training in a bright gym"
          className="h-56 w-full object-cover"
          src="/assets/fitness-coach-hero.png"
        />
        <div className="space-y-4 p-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">
              Today&apos;s workout
            </p>
            <h2 className="mt-1 text-2xl font-black">Phase 0 foundation</h2>
          </div>
          <p className="leading-7 text-stone-600">
            Next up: onboarding, equipment profile, exercise library JSON, then guided set-by-set
            logging.
          </p>
          <button className="min-h-12 w-full rounded-lg bg-emerald-900 px-4 font-black text-white">
            Start build
          </button>
        </div>
      </article>
    </section>
  );
}

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <section className="flex flex-1 flex-col justify-center gap-3">
      <p className="text-xs font-extrabold uppercase tracking-wider text-orange-600">Coming next</p>
      <h1 className="text-4xl font-black">{title}</h1>
      <p className="leading-7 text-stone-600">
        This screen will be implemented as the MVP phases progress.
      </p>
    </section>
  );
}
