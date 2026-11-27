import { useEffect, useMemo, useState } from "react";
import { Eye, FileText, Plus, Search, Trash2 } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { deleteCandidate, getCandidates } from "../../api/candidates.api";
import CandidateDeleteModal from "../../components/candidates/CandidateDeleteModal";
import CandidateStatusBadge from "../../components/candidates/CandidateStatusBadge";
import DataTable from "../../components/tables/DataTable";
import { getHttpErrorMessage } from "../../utils/httpError";

const STATUS_FILTERS = ["ALL", "PENDING", "INTERVIEW", "HIRED", "REJECTED"];

export default function CandidatesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [candidateToDelete, setCandidateToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCandidates() {
      setLoading(true);
      setError("");

      try {
        const data = await getCandidates();
        if (active) setCandidates(Array.isArray(data) ? data : []);
      } catch (requestError) {
        if (active) setError(getHttpErrorMessage(requestError));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCandidates();
    return () => {
      active = false;
    };
  }, []);

  function openDeleteModal(candidate) {
    setCandidateToDelete(candidate);
    setDeleteError("");
  }

  function closeDeleteModal() {
    if (deleting) return;
    setCandidateToDelete(null);
    setDeleteError("");
  }

  async function confirmDelete() {
    if (!candidateToDelete) return;

    setDeleting(true);
    setDeleteError("");
    setSuccessMessage("");

    try {
      await deleteCandidate(candidateToDelete.id);
      const refreshedCandidates = await getCandidates();
      setCandidates(
        Array.isArray(refreshedCandidates) ? refreshedCandidates : [],
      );
      const name =
        [candidateToDelete.firstName, candidateToDelete.lastName]
          .filter(Boolean)
          .join(" ") || candidateToDelete.email;
      setCandidateToDelete(null);
      setSuccessMessage(`${name} a été supprimé avec succès.`);
    } catch (requestError) {
      setDeleteError(getHttpErrorMessage(requestError));
    } finally {
      setDeleting(false);
    }
  }

  const filteredCandidates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesStatus =
        statusFilter === "ALL" || candidate.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        candidate.firstName?.toLowerCase().includes(normalizedSearch) ||
        candidate.lastName?.toLowerCase().includes(normalizedSearch) ||
        candidate.email?.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [candidates, search, statusFilter]);

  const columns = [
    {
      key: "firstName",
      label: "Prénom",
      render: (candidate) => (
        <button
          type="button"
          onClick={() => navigate(`/admin/candidats/${candidate.id}`)}
          className="font-semibold text-slate-900 hover:text-indigo-600"
        >
          {candidate.firstName || "—"}
        </button>
      ),
    },
    {
      key: "lastName",
      label: "Nom",
      render: (candidate) => candidate.lastName || "—",
    },
    {
      key: "email",
      label: "Email",
      render: (candidate) => (
        <span className="break-all text-slate-600">
          {candidate.email || "—"}
        </span>
      ),
    },
    {
      key: "phone",
      label: "Téléphone",
      render: (candidate) => candidate.phone || "—",
    },
    {
      key: "status",
      label: "Statut",
      render: (candidate) => <CandidateStatusBadge status={candidate.status} />,
    },
    {
      key: "cvPath",
      label: "CV",
      render: (candidate) =>
        candidate.cvPath ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <FileText size={15} /> Disponible
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-400">Non fourni</span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (candidate) => (
        <div className="flex items-center gap-2">
          <Link
            to={`/admin/candidats/${candidate.id}`}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <Eye size={15} /> Détails
          </Link>
          <button
            type="button"
            onClick={() => openDeleteModal(candidate)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50"
            aria-label="Supprimer le candidat"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {loading
              ? "Chargement des profils…"
              : `${filteredCandidates.length} candidat${filteredCandidates.length > 1 ? "s" : ""} affiché${filteredCandidates.length > 1 ? "s" : ""}`}
          </p>
        </div>

        <Link
          to="/admin/candidats/nouveau"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus size={17} /> Nouveau candidat
        </Link>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error || deleteError}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          {successMessage}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-20px_rgba(15,23,42,0.22)]">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between sm:px-5">
          <div className="relative w-full lg:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par nom, prénom ou email"
              className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition focus:border-indigo-500"
            aria-label="Filtrer par statut"
          >
            {STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {status === "ALL" ? "Tous les statuts" : status}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid min-h-64 place-items-center">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
              Chargement des candidats…
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={filteredCandidates}
            emptyMessage={
              candidates.length === 0
                ? "Aucun candidat n’a encore été enregistré."
                : "Aucun candidat ne correspond à votre recherche."
            }
          />
        )}
      </section>

      <CandidateDeleteModal
        candidate={candidateToDelete}
        open={Boolean(candidateToDelete)}
        deleting={deleting}
        error={deleteError}
        onCancel={closeDeleteModal}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
