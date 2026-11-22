import { Bell, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const titles = {
  "/admin": ["Tableau de bord", "Vue d’ensemble de la plateforme"],
  "/admin/utilisateurs": ["Utilisateurs", "Gestion des comptes Talentscope"],
  "/admin/candidats": ["Candidats", "Gestion des candidats"],
  "/admin/candidats/nouveau": ["Nouveau candidat", "Création d’un candidat"],
};

export default function Header() {
  const location = useLocation();
  const { email, role } = useAuth();

  let titleData = titles[location.pathname];

  if (!titleData && location.pathname.startsWith("/admin/candidats/")) {
    if (location.pathname.endsWith("/modifier")) {
      titleData = ["Modifier un candidat", "Modification du profil candidat"];
    } else {
      titleData = ["Détail du candidat", "Fiche du candidat"];
    }
  }

  const [title, subtitle] = titleData || ["Administration", "Talentscope"];

  return (
    <div className="flex w-full min-w-0 items-center justify-between gap-2">
      <div className="min-w-0 pr-3">
        <h1 className="truncate text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
          {title}
        </h1>
        <p className="hidden text-xs text-slate-500 sm:block">{subtitle}</p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 sm:flex">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700">
            {email?.charAt(0)?.toUpperCase()}
          </div>
          <div className="pr-1">
            <p className="max-w-36 truncate text-xs font-semibold text-slate-700">
              {email}
            </p>
            <p className="text-[10px] text-slate-400">{role}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>
    </div>
  );
}
