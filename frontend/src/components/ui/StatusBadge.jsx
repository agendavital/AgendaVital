const toneByStatus = {
  Apto: "success",
  "Apto con restricciones": "warning",
  "No apto": "danger",
  Finalizado: "success",
  Programada: "info",
  Restringido: "danger",
  Verificado: "success",
  Pendiente: "warning",
  "En proceso": "info"
};

export default function StatusBadge({ value }) {
  const tone = toneByStatus[value] ?? "neutral";
  return <span className={`badge badge-${tone}`}>{value}</span>;
}
