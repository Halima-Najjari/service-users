import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldAlert size={24} />
        </div>
        <h1 className="mt-5 text-2xl font-semibold text-slate-950">
          Accès refusé
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Votre rôle ne permet pas d’accéder à cette page.
        </p>
        <Link
          to="/espace"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Retour à l’espace sécurisé
        </Link>
      </section>
    </main>
  );
}
