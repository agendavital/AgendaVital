import { useSelector } from "react-redux";
import Card from "../components/ui/Card";

export default function ReportsPage() {
  const { appointments, documents } = useSelector((state) => state.data);

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Analitica operativa</p>
          <h1>Reportes</h1>
        </div>
      </div>
      <div className="metric-grid">
        <Card><span>Citas del periodo</span><strong>{appointments.length}</strong></Card>
        <Card><span>Documentos sensibles</span><strong>{documents.filter((item) => item.sensitive).length}</strong></Card>
        <Card><span>Conceptos emitidos</span><strong>1</strong></Card>
      </div>
    </section>
  );
}
