const STATUS_STYLES = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-100",
  INTERVIEW: "bg-sky-50 text-sky-700 border-sky-100",
  HIRED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  REJECTED: "bg-red-50 text-red-700 border-red-100",
};

const STATUS_LABELS = {
  PENDING: "En attente",
  INTERVIEW: "Entretien",
  HIRED: "Embauché",
  REJECTED: "Rejeté",
};

export default function CandidateStatusBadge({ status }) {
  const normalizedStatus = STATUS_LABELS[status] ? status : null;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        STATUS_STYLES[normalizedStatus] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      {normalizedStatus ? STATUS_LABELS[normalizedStatus] : "Inconnu"}
    </span>
  );
}
