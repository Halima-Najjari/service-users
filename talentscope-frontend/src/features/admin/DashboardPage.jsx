import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CircleGauge,
  Users,
  UserRoundCheck,
} from "lucide-react";
import { getCandidates } from "../../api/candidates.api";
import { getAllEvaluations } from "../../api/evaluations.api";
import { getUsers } from "../../api/users.api";
import StatCard from "../../components/dashboard/StatCard";
import { getHttpErrorMessage } from "../../utils/httpError";

const ROLES = ["ADMIN", "RH", "ENCADRANT", "STAGIAIRE"];

export default function DashboardPage() {
  const [users, setUsers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [evaluations, setEvaluations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [usersResult, candidatesResult, evaluationsResult] =
          await Promise.allSettled([
            getUsers(),
            getCandidates(),
            getAllEvaluations(),
          ]);

        if (!active) return;

        if (usersResult.status === "fulfilled") setUsers(usersResult.value);
        if (candidatesResult.status === "fulfilled")
          setCandidates(candidatesResult.value);
        if (evaluationsResult.status === "fulfilled")
          setEvaluations(evaluationsResult.value);

        const failedRequest = [
          usersResult,
          candidatesResult,
          evaluationsResult,
        ].find((result) => result.status === "rejected");
        if (failedRequest) {
          setError(
            "Certaines données n’ont pas pu être chargées. Vérifiez les CORS et les autorisations du backend.",
          );
        }
      } catch (requestError) {
        if (active) setError(getHttpErrorMessage(requestError));
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const roleCounts = ROLES.map((role) => ({
    role,
    count: users.filter((user) => user.role === role).length,
  }));

  if (loading) {
    return (
      <div className="grid min-h-[420px] place-items-center">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
          Chargement des données…
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-5 lg:space-y-6">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {error}
        </div>
      )}

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <StatCard
          title="Utilisateurs"
          value={users.length}
          description="Comptes enregistrés"
          icon={Users}
        />
        <StatCard
          title="Candidats"
          value={candidates.length}
          description="Profils enregistrés"
          icon={BriefcaseBusiness}
          tone="emerald"
        />
        <StatCard
          title="Encadrants"
          value={
            roleCounts.find(({ role }) => role === "ENCADRANT")?.count || 0
          }
          description="Utilisateurs au rôle ENCADRANT"
          icon={UserRoundCheck}
          tone="sky"
        />
        <StatCard
          title="Évaluations"
          value={Array.isArray(evaluations) ? "—" : "N/D"}
          description="Liste globale non disponible dans le backend"
          icon={CircleGauge}
          tone="amber"
        />
      </div>

      <section className="grid min-w-0 grid-cols-1 gap-5 lg:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.22)]">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Répartition des utilisateurs
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Calculée à partir de la liste des utilisateurs.
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {roleCounts.map(({ role, count }) => {
              const percentage = users.length
                ? Math.round((count / users.length) * 100)
                : 0;
              return (
                <div key={role}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{role}</span>
                    <span className="text-slate-400">
                      {count} · {percentage}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_-20px_rgba(15,23,42,0.22)]">
          <h2 className="text-base font-semibold text-slate-950">
            Informations disponibles
          </h2>
          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">
                Utilisateurs
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Données chargées depuis le backend.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Candidats</p>
              <p className="mt-1 text-sm text-slate-700">
                Données chargées depuis le backend.
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold text-amber-700">
                Évaluations
              </p>
              <p className="mt-1 text-sm text-amber-800">
                La liste globale actuelle retourne une liste vide.
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
