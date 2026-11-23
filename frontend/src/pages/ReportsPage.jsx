import { useCallback, useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { getReportSummary } from "../services/reportsService";
import "../styles/reports.css";

const EMPTY_SUMMARY = {
  metrics: {
    totalAppointments: 0,
    upcomingAppointments: 0,
    completedAppointments: 0,
    totalExamRequests: 0,
    totalEvaluations: 0,
    totalProcesses: 0,
  },
  appointmentsByStatus: [],
  examRequestsByType: [],
};

const METRICS = [
  ["Procesos ocupacionales", "totalProcesses"],
  ["Solicitudes de examen", "totalExamRequests"],
  ["Citas programadas", "upcomingAppointments"],
  ["Citas realizadas", "completedAppointments"],
  ["Evaluaciones registradas", "totalEvaluations"],
  ["Citas en total", "totalAppointments"],
];

export default function ReportsPage() {
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = useCallback(() => getReportSummary(), []);

  useEffect(() => {
    let isCurrent = true;
    fetchSummary()
      .then((data) => {
        if (isCurrent) setSummary(data);
      })
      .catch((loadError) => {
        if (isCurrent) setError(loadError.message ?? "No se pudo cargar el reporte.");
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [fetchSummary]);

  async function handleRefresh() {
    setIsLoading(true);
    setError("");
    try {
      setSummary(await fetchSummary());
    } catch (loadError) {
      setError(loadError.message ?? "No se pudo cargar el reporte.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="page-stack reports-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Analítica operativa</p>
          <h1>Reportes</h1>
          <p>Consulta el estado actual de los procesos, solicitudes y citas.</p>
        </div>
        <Button type="button" variant="secondary" onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? "Actualizando…" : "Actualizar reporte"}
        </Button>
      </div>

      {error ? <p className="alert alert-error" role="alert">{error}</p> : null}

      <div className="metric-grid reports-page__metrics" aria-live="polite">
        {METRICS.map(([label, key]) => (
          <Card key={key}>
            <span>{label}</span>
            <strong>{isLoading && !summary.generatedAt ? "—" : summary.metrics[key]}</strong>
          </Card>
        ))}
      </div>

      <div className="reports-page__breakdowns">
        <Card className="reports-page__breakdown">
          <h2>Citas por estado</h2>
          {summary.appointmentsByStatus.length ? (
            <ul>
              {summary.appointmentsByStatus.map((item) => (
                <li key={item.code}><span>{item.name}</span><strong>{item.count}</strong></li>
              ))}
            </ul>
          ) : <p>Aún no hay citas para clasificar.</p>}
        </Card>

        <Card className="reports-page__breakdown">
          <h2>Solicitudes por tipo de examen</h2>
          {summary.examRequestsByType.length ? (
            <ul>
              {summary.examRequestsByType.map((item) => (
                <li key={item.name}><span>{item.name}</span><strong>{item.count}</strong></li>
              ))}
            </ul>
          ) : <p>Aún no hay tipos de examen configurados.</p>}
        </Card>
      </div>

      {isLoading ? <p role="status">Cargando datos del reporte…</p> : null}
      {summary.generatedAt ? (
        <p className="reports-page__timestamp">
          Datos actualizados: {new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(summary.generatedAt))}
        </p>
      ) : null}
    </section>
  );
}
