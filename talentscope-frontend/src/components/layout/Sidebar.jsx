import {
  BriefcaseBusiness,
  LayoutDashboard,
  LogOut,
  Users,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navigation = [
  { label: "Vue d’ensemble", to: "/admin", icon: LayoutDashboard },
  { label: "Utilisateurs", to: "/admin/utilisateurs", icon: Users },
  { label: "Candidats", to: "/admin/candidats", icon: BriefcaseBusiness },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { logout, email } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      <div className="flex h-16 items-center border-b border-slate-100 px-5">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
          T
        </div>
        <div className="ml-3">
          <p className="font-semibold tracking-tight text-slate-950">
            Talentscope
          </p>
          <p className="text-xs text-slate-500">Administration</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Workspace
        </p>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`
              }
            >
              <Icon size={18} strokeWidth={1.8} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <div className="mb-2 px-3 py-2">
          <p className="truncate text-xs font-semibold text-slate-700">
            Administrateur
          </p>
          <p className="truncate text-xs text-slate-400">{email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={18} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}
