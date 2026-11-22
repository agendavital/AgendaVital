import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import DataTable from "../components/ui/DataTable";
import Field from "../components/ui/Field";
import StatusBadge from "../components/ui/StatusBadge";
import {
  createMedicalStaffMember,
  getMedicalStaff,
  getMedicalStaffOptions,
} from "../services/medicosService";
import "../styles/medical-staff.css";

const emptyForm = {
  nombres: "",
  apellidos: "",
  correo: "",
  clinicaId: "",
  registroProfesional: "",
  especialidad: "",
};

export default function MedicalStaffPage() {
  const [clinics, setClinics] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function refresh() {
    const [clinicOptions, staffRows] = await Promise.all([
      getMedicalStaffOptions(),
      getMedicalStaff(),
    ]);
    setClinics(clinicOptions);
    setProfessionals(staffRows);
  }

  useEffect(() => {
    let isMounted = true;
    Promise.all([getMedicalStaffOptions(), getMedicalStaff()])
      .then(([clinicOptions, staffRows]) => {
        if (!isMounted) return;
        setClinics(clinicOptions);
        setProfessionals(staffRows);
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError.message ?? "No se pudo cargar el personal médico.");
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
    setError("");
    setSuccess("");
    setIsSaving(true);
    try {
      const created = await createMedicalStaffMember({
        ...form,
        clinicaId: Number(form.clinicaId),
        especialidad: form.especialidad || undefined,
      });
      setForm(emptyForm);
      setSuccess(
        created.activationEmailSent
          ? "Perfil registrado. Se envió al profesional el enlace para configurar su contraseña."
          : "Perfil registrado, pero no se pudo enviar el enlace de activación. Revisa la configuración de correo antes de que inicie sesión.",
      );
      await refresh();
    } catch (createError) {
      setError(createError.message ?? "No se pudo registrar al profesional.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="page-stack medical-staff">
      <div className="page-header">
        <div>
          <p className="eyebrow">Administración de clínicas</p>
          <h1>Personal médico</h1>
          <p className="medical-staff__description">
            Vincula cada profesional con su clínica para habilitar el registro seguro de resultados ocupacionales.
          </p>
        </div>
      </div>

      {error ? <p className="alert alert-error" role="alert">{error}</p> : null}
      {success ? <p className="alert alert-success" role="status">{success}</p> : null}

      <section className="medical-staff__section" aria-labelledby="medical-staff-form-title">
        <div className="medical-staff__heading">
          <p className="eyebrow">Nuevo perfil</p>
          <h2 id="medical-staff-form-title">Registrar profesional</h2>
          <p>La cuenta tendrá rol médico y recibirá instrucciones para definir su contraseña.</p>
        </div>

        {clinics.length === 0 && !isLoading ? (
          <p className="alert alert-warning" role="status">Registra y activa una clínica antes de vincular profesionales.</p>
        ) : null}

        <form className="form medical-staff__form" onSubmit={handleSubmit}>
          <div className="medical-staff__fields">
            <Field label="Nombres">
              <input required maxLength={100} value={form.nombres} onChange={(event) => setForm({ ...form, nombres: event.target.value })} />
            </Field>
            <Field label="Apellidos">
              <input required maxLength={100} value={form.apellidos} onChange={(event) => setForm({ ...form, apellidos: event.target.value })} />
            </Field>
            <Field label="Correo electrónico">
              <input required type="email" maxLength={254} value={form.correo} onChange={(event) => setForm({ ...form, correo: event.target.value })} />
            </Field>
            <Field label="Clínica">
              <select required value={form.clinicaId} onChange={(event) => setForm({ ...form, clinicaId: event.target.value })}>
                <option value="">Selecciona una clínica</option>
                {clinics.map((clinic) => <option key={clinic.id} value={clinic.id}>{clinic.nombre}{clinic.ciudad ? ` · ${clinic.ciudad}` : ""}</option>)}
              </select>
            </Field>
            <Field label="Registro profesional">
              <input required maxLength={60} placeholder="Número de registro o tarjeta profesional" value={form.registroProfesional} onChange={(event) => setForm({ ...form, registroProfesional: event.target.value })} />
              <small className="medical-staff__field-hint">Ingresa el número exacto entregado por el profesional; el sistema no lo valida con un registro externo.</small>
            </Field>
            <Field label="Especialidad (opcional)">
              <input maxLength={120} placeholder="Escribe la especialidad, si aplica" value={form.especialidad} onChange={(event) => setForm({ ...form, especialidad: event.target.value })} />
              <small className="medical-staff__field-hint">Se guarda como texto libre; el catálogo de Especialidades todavía no está conectado.</small>
            </Field>
          </div>
          <div className="medical-staff__actions">
            <Button type="submit" disabled={isSaving || isLoading || clinics.length === 0}>
              {isSaving ? "Registrando profesional..." : "Registrar profesional"}
            </Button>
          </div>
        </form>
      </section>

      <section className="medical-staff__list" aria-labelledby="medical-staff-list-title">
        <div className="medical-staff__list-heading">
          <div>
            <h2 id="medical-staff-list-title">Profesionales registrados</h2>
            <p>Las evaluaciones solo pueden ser registradas por profesionales activos de la clínica correspondiente.</p>
          </div>
          <span className="medical-staff__count">{professionals.length} {professionals.length === 1 ? "profesional" : "profesionales"}</span>
        </div>
        {isLoading ? <p role="status">Cargando profesionales...</p> : (
          <DataTable
            rows={professionals}
            emptyMessage="Todavía no hay profesionales registrados."
            columns={[
              { key: "nombres", header: "Profesional", render: (professional) => `${professional.nombres} ${professional.apellidos}` },
              { key: "correo", header: "Correo" },
              { key: "registroProfesional", header: "Registro profesional" },
              { key: "clinica", header: "Clínica" },
              { key: "especialidad", header: "Especialidad", render: (professional) => professional.especialidad || "—" },
              { key: "activo", header: "Estado", render: (professional) => <StatusBadge value={professional.activo ? "Activo" : "Inactivo"} /> },
            ]}
          />
        )}
      </section>
    </section>
  );
}
