const toneByStatus = {
  Apto: "success",
  "Apto con restricciones": "warning",
  "No apto": "danger",
  Finalizado: "success",
  Programada: "info",
  Restringido: "danger",
  Verificado: "success",
  Pendiente: "warning",
  "En proceso": "info",
  Activa: "success",
  Inactiva: "neutral",
  Disponible: "success",
  Reservada: "info",
  CANCELADA: "neutral"
};

export default function StatusBadge({ value }) {
  const tone = toneByStatus[value] ?? "neutral";
  return <span className={`badge badge-${tone}`}>{value}</span>;
}
