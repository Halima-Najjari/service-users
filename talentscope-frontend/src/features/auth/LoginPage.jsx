import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getHttpErrorMessage } from "../../utils/httpError";

export default function LoginPage() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/espace" replace />;

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setServerError("");
  }

  function validate() {
    const nextErrors = {};
    if (!form.email.trim())
      nextErrors.email = "Adresse électronique obligatoire.";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      nextErrors.email = "Adresse électronique invalide.";
    if (!form.password) nextErrors.password = "Mot de passe obligatoire.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError("");

    try {
      await login(form.email.trim(), form.password);
      navigate(
        location.state?.from && location.state.from !== "/login"
          ? location.state.from
          : "/espace",
        { replace: true },
      );
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        setServerError("Email ou mot de passe incorrect.");
      } else {
        setServerError(getHttpErrorMessage(error));
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
      <section className="hidden overflow-hidden bg-slate-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-3 text-white">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500 text-lg font-bold">
            T
          </div>
          <div>
            <p className="font-semibold tracking-tight">Talentscope</p>
            <p className="text-xs text-slate-400">Gestion des talents</p>
          </div>
        </div>

        <div className="max-w-xl">
          <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-indigo-300">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight text-white">
            Pilotez vos talents avec clarté.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-400">
            Administration, gestion RH et suivi des évaluations dans un
            environnement sécurisé.
          </p>
        </div>

        <p className="text-sm text-slate-500">© 2026 Talentscope</p>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
              T
            </div>
            <div>
              <p className="font-semibold text-slate-950">Talentscope</p>
              <p className="text-xs text-slate-500">Gestion des talents</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.25)] sm:p-8">
            <p className="text-sm font-semibold text-indigo-600">
              Connexion sécurisée
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Bienvenue
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Connectez-vous à votre espace Talentscope.
            </p>

            {serverError && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {serverError}
              </div>
            )}

            <form className="mt-7 space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Adresse électronique
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={updateField}
                    aria-invalid={Boolean(errors.email)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="nom@entreprise.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <LockKeyhole
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={updateField}
                    aria-invalid={Boolean(errors.password)}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    placeholder="Votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={
                      showPassword
                        ? "Masquer le mot de passe"
                        : "Afficher le mot de passe"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Connexion…
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
