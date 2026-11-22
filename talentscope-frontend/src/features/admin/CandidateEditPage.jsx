import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Mail,
  Phone,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCandidate, patchCandidate } from "../../api/candidates.api";
import CandidateStatusBadge from "../../components/candidates/CandidateStatusBadge";
import { getHttpErrorMessage } from "../../utils/httpError";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "En attente" },
  { value: "INTERVIEW", label: "Entretien" },
  { value: "HIRED", label: "Embauché" },
  { value: "REJECTED", label: "Rejeté" },
];

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  status: "PENDING",
};

export default function CandidateEditPage() {
  const { candidateId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadCandidate() {
      setLoading(true);
      setLoadError("");

      try {
        const data = await getCandidate(candidateId);
        if (!active) return;

        setCandidate(data);
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phone: data.phone || "",
          status: data.status || "PENDING",
        });
      } catch (requestError) {
        if (active) setLoadError(getHttpErrorMessage(requestError));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCandidate();
    return () => {
      active = false;
    };
  }, [candidateId, reloadKey]);

  const candidateName = useMemo(() => {
    return [form.firstName.trim(), form.lastName.trim()]
      .filter(Boolean)
      .join(" ");
  }, [form.firstName, form.lastName]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSubmitError("");
  }

  function validate() {
    const nextErrors = {};

    if (!form.firstName.trim())
      nextErrors.firstName = "Le prénom est obligatoire.";
    if (!form.lastName.trim()) nextErrors.lastName = "Le nom est obligatoire.";

    if (!form.email.trim()) {
      nextErrors.email = "L’adresse électronique est obligatoire.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      nextErrors.email = "Saisissez une adresse électronique valide.";
    }

    if (!STATUS_OPTIONS.some((option) => option.value === form.status)) {
      nextErrors.status = "Sélectionnez un statut valide.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError("");

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      status: form.status,
    };

    try {
      await patchCandidate(candidateId, payload);
      navigate(`/admin/candidats/${candidateId}`, {
        replace: true,
        state: { successMessage: "Candidat modifié avec succès." },
      });
    } catch (requestError) {
      const backendMessage =
        typeof requestError?.response?.data === "string"
          ? requestError.response.data
          : "";
      setSubmitError(backendMessage || getHttpErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClassName = (fieldName) =>
    `h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 ${
      errors[fieldName]
        ? "border-red-300 focus:border-red-500 focus:ring-red-500/10"
        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10"
    }`;

  if (loading) {
    return (
      <div className="space-y-5" aria-busy="true">
        <div className="h-5 w-64 animate-pulse rounded bg-slate-200" />
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="h-7 w-56 max-w-full animate-pulse rounded bg-slate-200" />
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {[0, 1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-11 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (loadError) {
    const notFound = loadError === "La ressource demandée est introuvable.";

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
            : loadError}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to={`/admin/candidats/${candidateId}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <ArrowLeft size={16} /> Retour au détail
          </Link>
          {!notFound && (
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              <RefreshCw size={16} /> Réessayer
            </button>
          )}
        </div>
      </div>
    );
  }

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
        <Link
          to={`/admin/candidats/${candidateId}`}
          className="font-medium transition hover:text-indigo-600"
        >
          Détails
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-slate-700">Modifier</span>
      </nav>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.22)] sm:p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
            <UserRound size={22} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              Modifier le candidat
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {candidateName || "Modifiez les informations du candidat."}
            </p>
          </div>
        </div>

        {candidate && (
          <div className="mt-5 flex items-center gap-3">
            <CandidateStatusBadge status={candidate.status} />
          </div>
        )}

        {submitError && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Prénom <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserRound
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={updateField}
                  autoComplete="given-name"
                  className={`${fieldClassName("firstName")} pl-10`}
                  aria-invalid={Boolean(errors.firstName)}
                />
              </div>
              {errors.firstName && (
                <p className="mt-1.5 text-xs text-red-600">
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Nom <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <UserRound
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={updateField}
                  autoComplete="family-name"
                  className={`${fieldClassName("lastName")} pl-10`}
                  aria-invalid={Boolean(errors.lastName)}
                />
              </div>
              {errors.lastName && (
                <p className="mt-1.5 text-xs text-red-600">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Adresse électronique <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  autoComplete="email"
                  className={`${fieldClassName("email")} pl-10`}
                  aria-invalid={Boolean(errors.email)}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Téléphone{" "}
                <span className="text-xs font-normal text-slate-400">
                  (facultatif)
                </span>
              </label>
              <div className="relative">
                <Phone
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  size={17}
                />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={updateField}
                  autoComplete="tel"
                  placeholder="Ex. +216 20 000 000"
                  className={`${fieldClassName("phone")} pl-10`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Statut <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={updateField}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                aria-invalid={Boolean(errors.status)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="mt-1.5 text-xs text-red-600">{errors.status}</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              to={`/admin/candidats/${candidateId}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={16} /> Annuler
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />{" "}
                  Enregistrement…
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} /> Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
