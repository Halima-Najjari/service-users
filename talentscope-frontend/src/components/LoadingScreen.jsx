export default function LoadingScreen({ label = "Chargement…" }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50">
      <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        {label}
      </div>
    </main>
  );
}
