import { useEffect, useState } from 'react';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { getMyProcess } from '../services/candidatePortalService';

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`));
}

function formatDateTime(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function CandidatePortalPage() {
  const [processes, setProcesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getMyProcess()
      .then((data) => { if (active) setProcesses(data.processes ?? []); })
      .catch((requestError) => { if (active) setError(requestError.message ?? 'No se pudo cargar tu proceso.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const requests = processes.flatMap((process) => process.examRequests.map((request) => ({
    ...request,
    id: `${process.id}-${request.id}`,
    company: process.company,
  })));

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Portal del candidato</p>
          <h1>Mi proceso ocupacional</h1>
          <p>Consulta el estado de tus procesos, solicitudes de examen y citas programadas.</p>
        </div>
      </header>

      {error ? <p className="alert alert-error" role="alert">{error}</p> : null}
      {isLoading ? <p role="status">Cargando tu información...</p> : null}
      {!isLoading && !error ? (
        <>
          <section className="card" aria-labelledby="my-processes-title">
            <h2 id="my-processes-title">Procesos</h2>
            <DataTable
              rows={processes}
              emptyMessage="Todavía no tienes procesos ocupacionales registrados."
              columns={[
                { key: 'company', header: 'Empresa' },
                { key: 'status', header: 'Estado', render: (row) => <StatusBadge value={row.status} /> },
                { key: 'startDate', header: 'Fecha de inicio', render: (row) => formatDate(row.startDate) },
                { key: 'closeDate', header: 'Fecha de cierre', render: (row) => formatDate(row.closeDate) },
              ]}
            />
          </section>
          <section className="card" aria-labelledby="my-requests-title">
            <h2 id="my-requests-title">Exámenes y citas</h2>
            <DataTable
              rows={requests}
              emptyMessage="Aún no hay solicitudes de examen asociadas a tus procesos."
              columns={[
                { key: 'company', header: 'Empresa' },
                { key: 'examType', header: 'Tipo de examen' },
                { key: 'status', header: 'Estado de solicitud', render: (row) => <StatusBadge value={row.status} /> },
                { key: 'appointment', header: 'Cita', render: (row) => row.appointment ? `${formatDateTime(row.appointment.startsAt)} · ${row.appointment.clinic}${row.appointment.city ? `, ${row.appointment.city}` : ''} · ${row.appointment.status}` : 'Pendiente de programación' },
              ]}
            />
          </section>
        </>
      ) : null}
    </section>
  );
}
