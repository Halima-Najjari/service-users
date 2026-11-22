import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import ForbiddenPage from "./features/auth/ForbiddenPage";
import LoginPage from "./features/auth/LoginPage";
import ProtectedRoute from "./router/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import DashboardPage from "./features/admin/DashboardPage";
import UsersPage from "./features/admin/UsersPage";
import CandidateRoutePlaceholder from "./features/admin/CandidateRoutePlaceholder";
import CandidatesPage from "./features/admin/CandidatesPage";
import CandidateDetailsPage from "./features/admin/CandidateDetailsPage";
import CandidateCreatePage from "./features/admin/CandidateCreatePage";
import CandidateEditPage from "./features/admin/CandidateEditPage";

function App() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/espace" element={<Navigate to="/admin" replace />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/utilisateurs" element={<UsersPage />} />
            <Route path="/admin/candidats" element={<CandidatesPage />} />
            <Route
              path="/admin/candidats/nouveau"
              element={<CandidateCreatePage />}
            />
            <Route
              path="/admin/candidats/:candidateId"
              element={<CandidateDetailsPage />}
            />
            <Route
              path="/admin/candidats/:candidateId/modifier"
              element={<CandidateEditPage />}
            />
            <Route
              path="/admin/candidats/:candidateId/voir"
              element={<CandidateRoutePlaceholder />}
            />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ADMIN", "RH"]} />}>
          <Route path="/rh" element={<Navigate to="/espace" replace />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["ENCADRANT"]} />}>
          <Route
            path="/encadrant"
            element={<Navigate to="/espace" replace />}
          />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["STAGIAIRE"]} />}>
          <Route
            path="/stagiaire"
            element={<Navigate to="/espace" replace />}
          />
        </Route>

        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/" element={<Navigate to="/espace" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </main>
  );
}

export default App;
