import { BriefcaseBusiness } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";

export default function CandidateRoutePlaceholder() {
  const location = useLocation();
  const { candidateId } = useParams();

  let title = "Candidats";
  let description =
    "La liste des candidats sera développée dans la prochaine étape.";

  if (location.pathname.endsWith("/nouveau")) {
    title = "Nouveau candidat";
    description =
      "Le formulaire de création sera développé dans la prochaine étape.";
  } else if (location.pathname.endsWith("/modifier")) {
    title = "Modifier un candidat";
    description =
      "Le formulaire de modification sera développé dans la prochaine étape.";
  } else if (candidateId) {
    title = "Détail du candidat";
    description = "La fiche détaillée sera développée dans la prochaine étape.";
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.22)] sm:p-8">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
        <BriefcaseBusiness size={21} strokeWidth={1.8} />
      </div>
      <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {description}
      </p>
      {candidateId && (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs text-slate-500">
          UUID : {candidateId}
        </p>
      )}
    </section>
  );
}
