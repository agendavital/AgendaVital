import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import DataTable from "../components/ui/DataTable";
import Field from "../components/ui/Field";
import {
  createEvaluation,
  getEvaluationOptions,
  getEvaluations,
} from "../services/evaluacionesService";
import "../styles/medical-results.css";

const emptyOptions = {
  professionalConfigured: false,
  concepts: [],
  appointments: [],
};

const emptyForm = {
  citaId: "",
  conceptoOcupacionalId: "",
  resultadoResumen: "",
  hallazgos: "",
  observacionClinica: "",
  restriccion: "",
};

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function MedicalResultsPage() {
  const [options, setOptions] = useState(emptyOptions);
  const [evaluations, setEvaluations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");

  async function refresh() {
    const [formOptions, rows] = await Promise.all([
      getEvaluationOptions(),
      getEvaluations(),
    ]);
    setOptions(formOptions);
    setEvaluations(rows);
  }

  useEffect(() => {
    let isMounted = true;
    Promise.all([getEvaluationOptions(), getEvaluations()])
      .then(([formOptions, rows]) => {
        if (!isMounted) return;
        setOptions(formOptions);
        setEvaluations(rows);
      })
      .catch((error) => {
        if (isMounted) setLoadError(error.message ?? "No se pudieron cargar los resultados.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setSuccess("");
    setIsSaving(true);
    try {
      const evaluation = await createEvaluation({
        ...form,
        conceptoOcupacionalId: Number(form.conceptoOcupacionalId),
        hallazgos: form.hallazgos || undefined,
        observacionClinica: form.observacionClinica || undefined,
        restriccion: form.restriccion || undefined,
      });
      setForm(emptyForm);
      setSuccess(`Resultado de ${evaluation.candidato} registrado correctamente.`);
      await refresh();
    } catch (error) {
      setSubmitError(error.message ?? "No se pudo registrar el resultado.");
    } finally {
      setIsSaving(false);
    }
  }

  const canRegister =
    options.professionalConfigured &&
    options.concepts.length > 0 &&
    options.appointments.length > 0;

  return (
    <section className="page-stack medical-results">
      <div className="page-header">
        <div>
          <p className="eyebrow">Atención médica ocupacional</p>
          <h1>Resultados y conceptos</h1>
          <p className="medical-results__description">
            Registra el resultado de una cita atendida y el concepto emitido por el profesional.
          </p>
        </div>
      </div>

      {loadError ? <p className="alert alert-error" role="alert">{loadError}</p> : null}
      {success ? <p className="alert alert-success" role="status">{success}</p> : null}
      {isLoading ? <p role="status">Cargando citas y conceptos...</p> : null}

      {!isLoading && !loadError && !options.professionalConfigured ? (
        <p className="alert alert-warning" role="status">
          Tu cuenta aún no está vinculada a un perfil profesional activo. Pide al administrador que te registre en Personal médico.
        </p>
      ) : null}
      {!isLoading && options.professionalConfigured && options.concepts.length === 0 ? (
        <p className="alert alert-warning" role="status">
          No hay conceptos ocupacionales configurados en la base de datos. Deben cargarse en el catálogo antes de registrar resultados.
        </p>
      ) : null}
      {!isLoading && options.professionalConfigured && options.concepts.length > 0 && options.appointments.length === 0 ? (
        <p className="alert alert-warning" role="status">
          No hay citas atendidas pendientes de evaluación en tu clínica. La cita debe finalizar antes de registrar su resultado.
        </p>
      ) : null}

      {canRegister ? (
        <section className="medical-results__section" aria-labelledby="evaluation-form-title">
          <div className="medical-results__heading">
            <p className="eyebrow">Nueva evaluación</p>
            <h2 id="evaluation-form-title">Registrar resultado ocupacional</h2>
            <p>La cita debe haber finalizado. El sistema la vincula con tu perfil médico y la clínica asignada.</p>
          </div>

          <form className="form medical-results__form" onSubmit={handleSubmit}>
            <Field label="Cita atendida">
              <select required value={form.citaId} onChange={(event) => setForm({ ...form, citaId: event.target.value })}>
                <option value="">Selecciona una cita</option>
                {options.appointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id}>
                    {appointment.candidato} · {appointment.examen} · {formatDateTime(appointment.citaEn)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Concepto ocupacional">
              <select required value={form.conceptoOcupacionalId} onChange={(event) => setForm({ ...form, conceptoOcupacionalId: event.target.value })}>
                <option value="">Selecciona un concepto</option>
                {options.concepts.map((concept) => (
                  <option key={concept.id} value={concept.id}>{concept.nombre}</option>
                ))}
              </select>
            </Field>

            <Field label="Resumen del resultado">
              <textarea required minLength={3} maxLength={2000} rows={4} value={form.resultadoResumen} onChange={(event) => setForm({ ...form, resultadoResumen: event.target.value })} />
            </Field>
            <div className="medical-results__fields">
              <Field label="Hallazgos (opcional)">
                <textarea rows={4} value={form.hallazgos} onChange={(event) => setForm({ ...form, hallazgos: event.target.value })} />
              </Field>
              <Field label="Observación clínica (opcional)">
                <textarea rows={4} value={form.observacionClinica} onChange={(event) => setForm({ ...form, observacionClinica: event.target.value })} />
              </Field>
            </div>
            <Field label="Restricción ocupacional (opcional)">
              <textarea maxLength={5000} rows={3} value={form.restriccion} onChange={(event) => setForm({ ...form, restriccion: event.target.value })} />
            </Field>

            {submitError ? <p className="alert alert-error" role="alert">{submitError}</p> : null}
            <div className="medical-results__actions">
              <Button type="submit" disabled={isSaving || !form.citaId || !form.conceptoOcupacionalId}>
                {isSaving ? "Guardando resultado..." : "Guardar resultado"}
              </Button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="medical-results__list" aria-labelledby="evaluation-list-title">
        <div className="medical-results__list-heading">
          <div>
            <h2 id="evaluation-list-title">Evaluaciones registradas</h2>
            <p>Resultados asociados a citas de tu clínica.</p>
          </div>
          <span className="medical-results__count">{evaluations.length} {evaluations.length === 1 ? "evaluación" : "evaluaciones"}</span>
        </div>
        {!isLoading ? (
          <DataTable
            rows={evaluations}
            emptyMessage="Todavía no hay evaluaciones registradas."
            columns={[
              { key: "candidato", header: "Candidato" },
              { key: "examen", header: "Examen" },
              { key: "concepto", header: "Concepto" },
              { key: "resultadoResumen", header: "Resumen" },
              { key: "citaEn", header: "Cita", render: (evaluation) => formatDateTime(evaluation.citaEn) },
              { key: "evaluadaEn", header: "Evaluada", render: (evaluation) => formatDateTime(evaluation.evaluadaEn) },
            ]}
          />
        ) : null}
      </section>
    </section>
  );
}
