import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, UserRound, X } from "lucide-react";
import { createUser, deleteUser, getUsers } from "../../api/users.api";
import DataTable from "../../components/tables/DataTable";
import { getHttpErrorMessage } from "../../utils/httpError";

const ROLES = ["ADMIN", "RH", "ENCADRANT", "STAGIAIRE"];

const emptyForm = {
  email: "",
  password: "",
  role: "STAGIAIRE",
  encadrantId: "",
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsUser, setDetailsUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      setUsers(await getUsers());
    } catch (requestError) {
      setError(getHttpErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(
    () =>
      users.filter((user) => {
        const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
        const matchesSearch =
          !search.trim() ||
          user.email?.toLowerCase().includes(search.trim().toLowerCase());
        return matchesRole && matchesSearch;
      }),
    [users, roleFilter, search],
  );

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setFormErrors((current) => ({ ...current, [name]: "" }));
  }

  function validateForm() {
    const next = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email))
      next.email = "Adresse électronique invalide.";
    if (!form.password) next.password = "Mot de passe obligatoire.";
    if (!ROLES.includes(form.role)) next.role = "Rôle invalide.";
    setFormErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await createUser({
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        encadrantId:
          form.role === "STAGIAIRE" && form.encadrantId
            ? form.encadrantId
            : null,
      });
      setSuccess("Utilisateur créé avec succès.");
      setCreateOpen(false);
      setForm(emptyForm);
      await loadUsers();
    } catch (requestError) {
      setError(getHttpErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(user) {
    const confirmed = window.confirm(
      `Supprimer définitivement le compte ${user.email} ?`,
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");
    try {
      await deleteUser(user.id);
      setSuccess("Utilisateur supprimé avec succès.");
      await loadUsers();
    } catch (requestError) {
      setError(getHttpErrorMessage(requestError));
    }
  }

  const roleTone = (role) =>
    ({
      ADMIN: "bg-violet-50 text-violet-700",
      RH: "bg-sky-50 text-sky-700",
      ENCADRANT: "bg-emerald-50 text-emerald-700",
      STAGIAIRE: "bg-amber-50 text-amber-700",
    })[role] || "bg-slate-100 text-slate-700";

  const columns = [
    {
      key: "email",
      label: "Utilisateur",
      render: (user) => (
        <button
          type="button"
          onClick={() => setDetailsUser(user)}
          className="flex items-center gap-3 text-left"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
            <UserRound size={16} />
          </div>
          <span className="font-medium text-slate-800">{user.email}</span>
        </button>
      ),
    },
    {
      key: "role",
      label: "Rôle",
      render: (user) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleTone(user.role)}`}
        >
          {user.role}
        </span>
      ),
    },
    {
      key: "encadrant",
      label: "Encadrant",
      render: (user) => user.encadrant?.email || "—",
    },
    {
      key: "actions",
      label: "Actions",
      render: (user) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setDetailsUser(user)}
            className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Détails
          </button>
          <button
            type="button"
            onClick={() => handleDelete(user)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-red-100 text-red-600 hover:bg-red-50"
            aria-label={`Supprimer ${user.email}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
        >
          {success}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-20px_rgba(15,23,42,0.22)]">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un utilisateur"
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:w-64"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm text-slate-600 outline-none focus:border-indigo-500"
            >
              <option value="ALL">Tous les rôles</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex h-10 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus size={17} /> Nouvel utilisateur
          </button>
        </div>

        {loading ? (
          <div className="grid min-h-52 place-items-center text-sm text-slate-500">
            Chargement des utilisateurs…
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={filteredUsers}
            emptyMessage="Aucun utilisateur ne correspond aux filtres."
          />
        )}
      </section>

      {createOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Nouvel utilisateur
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Créer un compte Talentscope.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-6 space-y-4" noValidate>
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                  htmlFor="email"
                >
                  Adresse électronique
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateForm}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
                {formErrors.email && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.email}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                  htmlFor="password"
                >
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={updateForm}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
                {formErrors.password && (
                  <p className="mt-1 text-xs text-red-600">
                    {formErrors.password}
                  </p>
                )}
              </div>
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                  htmlFor="role"
                >
                  Rôle
                </label>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={updateForm}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              {form.role === "STAGIAIRE" && (
                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                    htmlFor="encadrantId"
                  >
                    UUID de l’encadrant{" "}
                    <span className="font-normal text-slate-400">
                      (optionnel)
                    </span>
                  </label>
                  <input
                    id="encadrantId"
                    name="encadrantId"
                    value={form.encadrantId}
                    onChange={updateForm}
                    placeholder="Entrez un UUID existant"
                    className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-11 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {submitting ? "Création…" : "Créer le compte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailsUser && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-semibold text-slate-950">
                Détails utilisateur
              </h2>
              <button
                type="button"
                onClick={() => setDetailsUser(null)}
                className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>
            <dl className="mt-6 space-y-3">
              <div className="rounded-xl border border-slate-200 px-4 py-3">
                <dt className="text-xs text-slate-400">Adresse électronique</dt>
                <dd className="mt-1 break-all text-sm font-medium text-slate-700">
                  {detailsUser.email}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-200 px-4 py-3">
                <dt className="text-xs text-slate-400">Rôle</dt>
                <dd className="mt-1 text-sm font-medium text-slate-700">
                  {detailsUser.role}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-200 px-4 py-3">
                <dt className="text-xs text-slate-400">UUID</dt>
                <dd className="mt-1 break-all font-mono text-xs text-slate-600">
                  {detailsUser.id}
                </dd>
              </div>
              <div className="rounded-xl border border-slate-200 px-4 py-3">
                <dt className="text-xs text-slate-400">Encadrant</dt>
                <dd className="mt-1 text-sm font-medium text-slate-700">
                  {detailsUser.encadrant?.email || "Aucun"}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
