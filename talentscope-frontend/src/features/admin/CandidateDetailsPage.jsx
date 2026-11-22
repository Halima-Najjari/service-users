import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  FileText,
  Mail,
  Phone,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { getCandidate } from "../../api/candidates.api";
import CandidateStatusBadge from "../../components/candidates/CandidateStatusBadge";
import { getHttpErrorMessage } from "../../utils/httpError";

export default function CandidateDetailsPage() {
  const { candidateId } = useParams();
  const location = useLocation();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadCandidate() {
      setLoading(true);
      setError("");

      try {
        const data = await getCandidate(candidateId);
        if (active) setCandidate(data);
      } catch (requestError) {
        if (active) setError(getHttpErrorMessage(requestError));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCandidate();
    return () => {
      active = false;
    };
  }, [candidateId, reloadKey]);

  if (loading) {
    return (
      <div className="space-y-5" aria-busy="true">
        <div className="h-5 w-64 animate-pulse rounded bg-slate-200" />
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-48 max-w-full animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </section>
        <div className="grid gap-5 lg:grid-cols-2">
          {[0, 1].map((item) => (
            <div
              key={item}
              className="min-h-64 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    const notFound = error === "La ressource demandée est introuvable.";

    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-[0_8px_30px_-20px_rgba(15,23,42,0.22)] sm:p-8">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
          <UserRound size={22} />
        </div>
        <h2 className="mt-5 text-xl font-semibold text-slate-950">
          {notFound
            ? "Candidat introuvable"
            : "Impossible de charger le candidat"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {notFound
            ? "Ce candidat n’existe pas ou n’est plus disponible."
            : error}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/admin/candidats"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} /> Retour aux candidats
          </Link>
          {!notFound && (
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <RefreshCw size={16} /> Réessayer
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!candidate) return null;

  const fullName =
    [candidate.firstName, candidate.lastName].filter(Boolean).join(" ") ||
    "Candidat";

  return (
    <div className="w-full min-w-0 space-y-5 lg:space-y-6">
      <nav
        className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
        aria-label="Fil d’Ariane"
      >
        <Link
          to="/admin/candidats"
          className="font-medium transition hover:text-indigo-600"
        >
          Candidats
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-700">Détails du candidat</span>
      </nav>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.22)] sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
              <BriefcaseBusiness size={24} strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                {fullName}
              </h1>
              <div className="mt-2">
                <CandidateStatusBadge status={candidate.status} />
              </div>
            </div>
          </div>

          <Link
            to="/admin/candidats"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} /> Retour
          </Link>
        </div>
      </section>

      <section className="grid min-w-0 grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
        <article className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.22)] sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">
            Informations personnelles
          </h2>
          <dl className="mt-5 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <dt className="text-xs font-medium text-slate-400">Prénom</dt>
              <dd className="mt-1 break-words text-sm font-semibold text-slate-800">
                {candidate.firstName || "—"}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <dt className="text-xs font-medium text-slate-400">Nom</dt>
              <dd className="mt-1 break-words text-sm font-semibold text-slate-800">
                {candidate.lastName || "—"}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Mail size={13} /> Adresse électronique
              </dt>
              {candidate.email ? (
                <dd className="mt-1">
                  <a
                    href={`mailto:${candidate.email}`}
                    className="break-all text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    {candidate.email}
                  </a>
                </dd>
              ) : (
                <dd className="mt-1 text-sm font-semibold text-slate-800">—</dd>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Phone size={13} /> Téléphone
              </dt>
              {candidate.phone ? (
                <dd className="mt-1">
                  <a
                    href={`tel:${candidate.phone}`}
                    className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    {candidate.phone}
                  </a>
                </dd>
              ) : (
                <dd className="mt-1 text-sm font-semibold text-slate-800">—</dd>
              )}
            </div>
          </dl>
        </article>

        <article className="min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.22)] sm:p-6">
          <h2 className="text-base font-semibold text-slate-950">
            Statut et CV
          </h2>
          <dl className="mt-5 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <dt className="text-xs font-medium text-slate-400">
                Statut du dossier
              </dt>
              <dd className="mt-2">
                <CandidateStatusBadge status={candidate.status} />
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <FileText size={13} /> Curriculum vitae
              </dt>
              <dd className="mt-2">
                {candidate.cvPath ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> CV
                    disponible
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-slate-500">
                    Aucun CV fourni
                  </span>
                )}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <dt className="text-xs font-medium text-slate-400">
                Identifiant candidat
              </dt>
              <dd className="mt-2 break-all font-mono text-xs text-slate-600">
                {candidate.id || candidateId}
              </dd>
            </div>
          </dl>
        </article>
      </section>
    </div>
  );
}
