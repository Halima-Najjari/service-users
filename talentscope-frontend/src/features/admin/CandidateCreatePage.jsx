import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  LoaderCircle,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createCandidate } from "../../api/candidates.api";
import { getHttpErrorMessage } from "../../utils/httpError";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "En attente" },
  { value: "INTERVIEW", label: "Entretien" },
  { value: "HIRED", label: "Embauché" },
  { value: "REJECTED", label: "Rejeté" },
];

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  status: "PENDING",
};

export default function CandidateCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

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
    setSuccess("");
  }

  function validate() {
    const nextErrors = {};

    if (!form.firstName.trim()) {
      nextErrors.firstName = "Le prénom est obligatoire.";
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName = "Le nom est obligatoire.";
    }

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
    setSuccess("");

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      status: form.status,
    };

    try {
      const createdCandidate = await createCandidate(payload);
      setSuccess("Le candidat a été créé avec succès.");

      if (createdCandidate?.id) {
        navigate(`/admin/candidats/${createdCandidate.id}`, {
          replace: true,
          state: { successMessage: "Candidat créé avec succès." },
        });
      } else {
        navigate("/admin/candidats", {
          replace: true,
          state: { successMessage: "Candidat créé avec succès." },
        });
      }
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
        <span className="text-slate-700">Nouveau candidat</span>
      </nav>

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.22)] sm:p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
            <BriefcaseBusiness size={22} strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              Nouveau candidat
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Ajoutez les informations principales du candidat au dossier de
              recrutement.
            </p>
          </div>
        </div>

        {candidateName && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-sm text-indigo-800">
            Profil préparé pour{" "}
            <span className="font-semibold">{candidateName}</span>
          </div>
        )}

        {submitError && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {submitError}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
          >
            <CheckCircle2 size={17} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-1">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Prénom{" "}
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
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
                  placeholder="Ex. Nadia"
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
                Nom{" "}
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
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
                  placeholder="Ex. Ben Ali"
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
                Adresse électronique{" "}
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
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
                  placeholder="candidate@example.com"
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
                Statut{" "}
                <span className="text-red-500" aria-hidden="true">
                  *
                </span>
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
              to="/admin/candidats"
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
                  <LoaderCircle size={17} className="animate-spin" /> Création…
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} /> Créer le candidat
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
