export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "indigo",
}) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
  };

  return (
    <article className="min-h-36 w-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.22)]">
      <div className="flex h-full min-w-0 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold leading-none tracking-tight text-slate-950">
            {value}
          </p>
          {description && (
            <p className="mt-2 text-xs leading-5 text-slate-400">
              {description}
            </p>
          )}
        </div>
        {Icon && (
          <div
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tones[tone]}`}
          >
            <Icon size={20} strokeWidth={1.8} />
          </div>
        )}
      </div>
    </article>
  );
}
