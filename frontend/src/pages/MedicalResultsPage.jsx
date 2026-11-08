import { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";

export default function MedicalResultsPage() {
  const [form, setForm] = useState({
    candidate: "Maria Gomez",
    resultSummary: "",
    concept: "Apto"
  });
  const [saved, setSaved] = useState(false);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Acto medico</p>
          <h1>Resultados y conceptos</h1>
        </div>
      </div>
      <Card>
        <form className="form" onSubmit={handleSubmit}>
          <Field label="Candidato">
            <input name="candidate" value={form.candidate} onChange={handleChange} />
          </Field>
          <Field label="Resumen medico">
            <textarea name="resultSummary" value={form.resultSummary} onChange={handleChange} rows="5" />
          </Field>
          <Field label="Concepto ocupacional">
            <select name="concept" value={form.concept} onChange={handleChange}>
              <option>Apto</option>
              <option>Apto con restricciones</option>
              <option>No apto</option>
            </select>
          </Field>
          {saved ? <div className="alert alert-success">Resultado registrado en estado local.</div> : null}
          <Button type="submit">Guardar resultado</Button>
        </form>
      </Card>
    </section>
  );
}
