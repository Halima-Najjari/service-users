import { LogOut, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AuthenticatedPlaceholder() {
  const { email, role, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 font-bold text-white">
              T
            </div>
            <div>
              <p className="font-semibold text-slate-950">Talentscope</p>
              <p className="text-xs text-slate-500">Espace authentifié</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <LogOut size={16} />{" "}
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </header>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ShieldCheck size={24} />
          </div>
          <p className="mt-6 text-sm font-semibold text-emerald-600">
            Session validée
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            Vous êtes connecté
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Les fonctionnalités métier ne sont pas encore activées dans cette
            phase. Votre session JWT réelle est protégée et restaurée depuis le
            backend.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Utilisateur
              </dt>
              <dd className="mt-2 break-all text-sm font-medium text-slate-800">
                {email}
              </dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Rôle
              </dt>
              <dd className="mt-2 text-sm font-medium text-slate-800">
                {role}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </main>
  );
}
