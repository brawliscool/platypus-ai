import {
  Bell,
  Car,
  ChevronDown,
  Grid2X2,
  Heart,
  Home,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Star,
  UserRound,
} from "lucide-react";

const cars = [
  {
    name: "BMW M4 Sport",
    meta: "Dream car",
    color: "from-orange-500 via-red-700 to-black",
    light: "bg-orange-300",
    favorite: false,
  },
  {
    name: "Mercedes AMG GT",
    meta: "Modern classic",
    color: "from-zinc-400 via-zinc-700 to-black",
    light: "bg-slate-200",
    favorite: true,
  },
  {
    name: "Toyota Supra MK4",
    meta: "Street build",
    color: "from-white via-zinc-300 to-zinc-900",
    light: "bg-white",
    favorite: false,
  },
  {
    name: "Audi RS7",
    meta: "Daily driver",
    color: "from-zinc-800 via-black to-zinc-950",
    light: "bg-amber-200",
    favorite: false,
  },
  {
    name: "Nissan Skyline",
    meta: "Race tuned",
    color: "from-slate-600 via-zinc-900 to-black",
    light: "bg-blue-200",
    favorite: false,
  },
  {
    name: "Ferrari F8",
    meta: "Weekend ride",
    color: "from-red-600 via-red-950 to-black",
    light: "bg-red-300",
    favorite: false,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#050608] text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-[390px] flex-col bg-[radial-gradient(circle_at_50%_-10%,#1c2548_0%,#0b0d14_36%,#050608_72%)] px-5 pb-24 pt-5 shadow-2xl shadow-black">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-medium text-zinc-500">My Collection</p>
            <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.04em]">
              My Garage
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-zinc-300 ring-1 ring-white/10">
              <Search className="h-4 w-4" />
            </button>
            <button className="relative grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-zinc-300 ring-1 ring-white/10">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
            </button>
          </div>
        </header>

        <section className="mt-6 rounded-[28px] bg-[#10131d]/90 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.45)] ring-1 ring-white/[0.06]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-400/20">
                <Car className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-end gap-1.5">
                  <span className="text-[28px] font-semibold leading-none tracking-[-0.05em]">
                    42
                  </span>
                  <span className="pb-1 text-[11px] font-medium text-zinc-500">
                    cars
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-500">
                  5 added this month
                </p>
              </div>
            </div>
            <div className="relative grid h-16 w-16 place-items-center rounded-full">
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(#315CFF_0_78%,#262b3b_78%_100%)]" />
              <div className="absolute inset-1.5 rounded-full bg-[#10131d]" />
              <div className="relative text-center">
                <p className="text-sm font-semibold">78%</p>
                <p className="text-[8px] uppercase tracking-wider text-zinc-500">
                  full
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex rounded-full bg-white/[0.04] p-1 ring-1 ring-white/[0.06]">
            {["All Cars", "Sport", "Classic"].map((item, index) => (
              <button
                key={item}
                className={`rounded-full px-3.5 py-2 text-[11px] font-medium transition ${
                  index === 0
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-950/60"
                    : "text-zinc-500"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-zinc-400 ring-1 ring-white/[0.08]">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3.5">
          {cars.map((car) => (
            <article
              key={car.name}
              className="overflow-hidden rounded-[22px] bg-[#10131d] shadow-[0_14px_35px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.05]"
            >
              <div
                className={`relative h-[112px] overflow-hidden bg-gradient-to-br ${car.color}`}
              >
                <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute left-3 right-3 top-8 h-10 rounded-[100%] bg-black/35 blur-sm" />
                <div className="absolute bottom-7 left-5 right-5 h-5 rounded-t-[24px] bg-zinc-950 shadow-2xl" />
                <div className="absolute bottom-9 left-8 right-8 h-7 rounded-t-[28px] border-t border-white/25 bg-white/10 backdrop-blur-sm" />
                <div className="absolute bottom-5 left-4 right-4 h-5 rounded-lg bg-zinc-950" />
                <span className={`absolute bottom-6 left-6 h-1.5 w-4 rounded-full ${car.light}`} />
                <span className={`absolute bottom-6 right-6 h-1.5 w-4 rounded-full ${car.light}`} />
                <button className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-black/30 text-white/80 backdrop-blur-md">
                  <Heart className={`h-3.5 w-3.5 ${car.favorite ? "fill-white" : ""}`} />
                </button>
              </div>
              <div className="p-3">
                <h2 className="truncate text-[12px] font-semibold tracking-[-0.02em]">
                  {car.name}
                </h2>
                <div className="mt-1.5 flex items-center justify-between">
                  <p className="text-[10px] text-zinc-500">{car.meta}</p>
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <button className="fixed bottom-16 left-1/2 z-20 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-blue-600 text-white shadow-[0_15px_35px_rgba(37,91,255,0.55)] ring-4 ring-[#070910]">
        <Plus className="h-6 w-6" />
      </button>

      <nav className="fixed bottom-0 left-1/2 z-10 grid h-20 w-full max-w-[390px] -translate-x-1/2 grid-cols-5 items-center rounded-t-[28px] bg-[#0b0d14]/95 px-5 pb-3 pt-3 text-zinc-600 shadow-[0_-20px_45px_rgba(0,0,0,0.45)] backdrop-blur-xl ring-1 ring-white/[0.06]">
        {[
          { icon: Home, label: "Home", active: true },
          { icon: Grid2X2, label: "Garage" },
          { icon: Star, label: "Saved" },
          { icon: Settings, label: "Tools" },
          { icon: UserRound, label: "Profile" },
        ].map((item) => (
          <button
            key={item.label}
            className={`flex flex-col items-center gap-1 text-[9px] font-medium ${
              item.active ? "text-blue-500" : "text-zinc-600"
            }`}
          >
            <item.icon className="h-4.5 w-4.5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </main>
  );
}
