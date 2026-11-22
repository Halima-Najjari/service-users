import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  FileText,
  Mail,
  Phone,
  Pencil,
  RefreshCw,
  UserRound,
  Download,
  Upload,
  Eye,
} from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  downloadCandidateCv,
  getCandidate,
  uploadCandidateCv,
} from "../../api/candidates.api";
import CandidateStatusBadge from "../../components/candidates/CandidateStatusBadge";
import { getHttpErrorMessage } from "../../utils/httpError";

export default function CandidateDetailsPage() {
  const { candidateId } = useParams();
  const location = useLocation();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvDownloading, setCvDownloading] = useState(false);
  const [cvPreviewing, setCvPreviewing] = useState(false);
  const [cvError, setCvError] = useState("");
  const [cvSuccess, setCvSuccess] = useState("");

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

  async function handleCvUpload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setCvError("");
    setCvSuccess("");

    if (file.type !== "application/pdf") {
      setCvError("Le fichier doit être au format PDF.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setCvError("Le CV ne doit pas dépasser 5 Mo.");
      return;
    }

    setCvUploading(true);

    try {
      await uploadCandidateCv(candidateId, file);
      const refreshedCandidate = await getCandidate(candidateId);
      setCandidate(refreshedCandidate);
      setCvSuccess("CV téléversé avec succès.");
    } catch (requestError) {
      const backendMessage =
        typeof requestError?.response?.data === "string"
          ? requestError.response.data
          : "";
      setCvError(backendMessage || getHttpErrorMessage(requestError));
    } finally {
      setCvUploading(false);
    }
  }

  function getCvFilename() {
    if (!candidate?.cvPath) return null;
    const normalizedPath = candidate.cvPath.replaceAll("\\", "/");
    return normalizedPath.split("/").pop() || null;
  }

  async function handleCvPreview() {
    setCvError("");
    setCvSuccess("");
    setCvPreviewing(true);

    const previewWindow = window.open("", "_blank", "noopener,noreferrer");
    if (!previewWindow) {
      setCvPreviewing(false);
      setCvError(
        "Le navigateur a bloqué la nouvelle fenêtre. Autorisez les fenêtres contextuelles pour consulter le CV.",
      );
      return;
    }

    try {
      const blob = await downloadCandidateCv(candidateId);
      const url = window.URL.createObjectURL(blob);
      previewWindow.location.href = url;
      window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch (requestError) {
      previewWindow.close();
      setCvError(getHttpErrorMessage(requestError));
    } finally {
      setCvPreviewing(false);
    }
  }

  async function handleCvDownload() {
    setCvError("");
    setCvSuccess("");
    setCvDownloading(true);

    try {
      const blob = await downloadCandidateCv(candidateId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = getCvFilename() || "cv-candidat.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1_000);
    } catch (requestError) {
      setCvError(getHttpErrorMessage(requestError));
    } finally {
      setCvDownloading(false);
    }
  }

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

      {location.state?.successMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          {location.state.successMessage}
        </div>
      )}

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

          <div className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row">
            <Link
              to="/admin/candidats"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={16} /> Retour
            </Link>
            <Link
              to={`/admin/candidats/${candidateId}/modifier`}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Pencil size={16} /> Modifier
            </Link>
          </div>
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

          {cvError && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {cvError}
            </div>
          )}

          {cvSuccess && (
            <div
              role="status"
              className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
            >
              {cvSuccess}
            </div>
          )}

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
              <dd className="mt-3 space-y-3">
                {candidate.cvPath ? (
                  <>
                    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5">
                      <FileText
                        size={16}
                        className="shrink-0 text-emerald-600"
                      />
                      <span className="min-w-0 truncate text-sm font-semibold text-emerald-800">
                        {getCvFilename()}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      <button
                        type="button"
                        onClick={handleCvPreview}
                        disabled={cvPreviewing}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Eye size={16} />
                        {cvPreviewing ? "Ouverture…" : "Consulter le CV"}
                      </button>

                      <button
                        type="button"
                        onClick={handleCvDownload}
                        disabled={cvDownloading}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Download size={16} />
                        {cvDownloading
                          ? "Téléchargement…"
                          : "Télécharger le CV"}
                      </button>

                      <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                        <Upload size={16} />
                        {cvUploading ? "Remplacement…" : "Remplacer le CV"}
                        <input
                          type="file"
                          accept="application/pdf,.pdf"
                          onChange={handleCvUpload}
                          disabled={cvUploading}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-semibold text-slate-500">
                      Aucun CV fourni
                    </span>
                    <label className="mt-3 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">
                      <Upload size={16} />
                      {cvUploading ? "Téléversement…" : "Ajouter un CV"}
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handleCvUpload}
                        disabled={cvUploading}
                        className="sr-only"
                      />
                    </label>
                  </>
                )}

                <p className="text-xs leading-5 text-slate-400">
                  PDF uniquement, taille maximale 5 Mo.
                </p>
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
