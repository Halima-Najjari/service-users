import { AlertTriangle, LoaderCircle, X } from "lucide-react";

export default function CandidateDeleteModal({
  candidate,
  open,
  deleting = false,
  error = "",
  onCancel,
  onConfirm,
}) {
  if (!open || !candidate) return null;

  const fullName =
    [candidate.firstName, candidate.lastName].filter(Boolean).join(" ") ||
    candidate.email ||
    "ce candidat";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="candidate-delete-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
            <AlertTriangle size={20} />
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>

        <h2
          id="candidate-delete-title"
          className="mt-5 text-xl font-semibold tracking-tight text-slate-950"
        >
          Supprimer le candidat
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Voulez-vous vraiment supprimer{" "}
          <span className="font-semibold text-slate-800">{fullName}</span> ?
          Cette action supprimera également son CV associé.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <>
                <LoaderCircle size={16} className="animate-spin" /> Suppression…
              </>
            ) : (
              "Supprimer définitivement"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
