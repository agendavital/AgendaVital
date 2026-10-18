import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <main className="public-shell">
      <section className="brand-panel">
        <div>
          <p className="eyebrow">Gestion ocupacional empresarial</p>
          <h1>Agenda Vital</h1>
          <p>
            Plataforma para coordinar candidatos, empresas, clinicas, medicos,
            documentos, citas, resultados y conceptos ocupacionales.
          </p>
        </div>
      </section>
      <section className="auth-panel">
        <Outlet />
      </section>
    </main>
  );
}
