import { useEffect, useState } from 'react';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import { getDocuments } from '../services/documentsService';

function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`));
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getDocuments()
      .then((rows) => { if (active) setDocuments(rows); })
      .catch((requestError) => { if (active) setError(requestError.message ?? 'No se pudieron cargar los documentos.'); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Gestión documental</p>
          <h1>Documentos</h1>
          <p>Consulta los metadatos y el estado de los documentos vinculados a los procesos que puedes ver.</p>
        </div>
      </header>
      <p className="alert alert-info">
        Por seguridad, esta vista muestra información descriptiva. Los archivos y sus ubicaciones privadas no se exponen aquí.
      </p>
      {error ? <p className="alert alert-error" role="alert">{error}</p> : null}
      {isLoading ? <p role="status">Cargando documentos...</p> : null}
      {!isLoading && !error ? (
        <DataTable
          rows={documents}
          emptyMessage="Todavía no hay documentos registrados para los procesos a los que tienes acceso."
          columns={[
            { key: 'fileName', header: 'Archivo' },
            { key: 'type', header: 'Tipo' },
            { key: 'candidateName', header: 'Candidato' },
            { key: 'company', header: 'Empresa' },
            { key: 'status', header: 'Estado', render: (row) => <StatusBadge value={row.status} /> },
            { key: 'createdAt', header: 'Registrado', render: (row) => new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(row.createdAt)) },
            { key: 'expiresAt', header: 'Vencimiento', render: (row) => formatDate(row.expiresAt) },
          ]}
        />
      ) : null}
    </section>
  );
}
