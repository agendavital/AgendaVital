import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import Button from '../components/ui/Button';
import DataTable from '../components/ui/DataTable';
import Field from '../components/ui/Field';
import StatusBadge from '../components/ui/StatusBadge';
import { createClinic, listClinics, updateClinicStatus } from '../services/clinicasService';
import {
  cancelAvailability,
  createAvailability,
  listManagedAvailability,
} from '../services/horariosService';
import '../styles/clinic-management.css';

const emptyClinic = {
  nit: '',
  nombre: '',
  direccion: '',
  ciudad: '',
  correo: '',
  telefono: '',
};

function getLocalDateTimeMinimum() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function ClinicManagementPage() {
  const [clinics, setClinics] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [clinicForm, setClinicForm] = useState(emptyClinic);
  const [slotForm, setSlotForm] = useState({ clinicaId: '', inicioEn: '', finEn: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingClinic, setIsSavingClinic] = useState(false);
  const [isSavingSlot, setIsSavingSlot] = useState(false);
  const [pageError, setPageError] = useState('');
  const [clinicError, setClinicError] = useState('');
  const [slotError, setSlotError] = useState('');
  const [success, setSuccess] = useState('');

  const refresh = useCallback(async () => {
    try {
      const [clinicRows, slotRows] = await Promise.all([
        listClinics(),
        listManagedAvailability(),
      ]);
      setClinics(clinicRows);
      setAvailability(slotRows);
    } catch (error) {
      setPageError(error.message ?? 'No se pudieron cargar las clínicas y horarios.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refresh);
  }, [refresh]);

  const activeClinics = clinics.filter((clinic) => clinic.activa);

  async function handleCreateClinic(event) {
    event.preventDefault();
    setPageError('');
    setClinicError('');
    setSuccess('');
    setIsSavingClinic(true);
    try {
      await createClinic({
        ...clinicForm,
        direccion: clinicForm.direccion || undefined,
        ciudad: clinicForm.ciudad || undefined,
        correo: clinicForm.correo || undefined,
        telefono: clinicForm.telefono || undefined,
      });
      setClinicForm(emptyClinic);
      setSuccess('La clínica se registró correctamente.');
      await refresh();
    } catch (error) {
      setClinicError(error.message ?? 'No se pudo registrar la clínica.');
    } finally {
      setIsSavingClinic(false);
    }
  }

  async function handleClinicStatus(clinic) {
    setPageError('');
    setSuccess('');
    try {
      await updateClinicStatus(clinic.id, !clinic.activa);
      setSuccess(`La clínica quedó ${clinic.activa ? 'inactiva' : 'activa'}.`);
      await refresh();
    } catch (error) {
      setPageError(error.message ?? 'No se pudo actualizar la clínica.');
    }
  }

  async function handleCreateAvailability(event) {
    event.preventDefault();
    setPageError('');
    setSlotError('');
    setSuccess('');
    setIsSavingSlot(true);
    try {
      await createAvailability({
        clinicaId: Number(slotForm.clinicaId),
        inicioEn: new Date(slotForm.inicioEn).toISOString(),
        finEn: new Date(slotForm.finEn).toISOString(),
      });
      setSlotForm({ clinicaId: slotForm.clinicaId, inicioEn: '', finEn: '' });
      setSuccess('El horario quedó disponible para programar una cita.');
      await refresh();
    } catch (error) {
      setSlotError(error.message ?? 'No se pudo registrar el horario.');
    } finally {
      setIsSavingSlot(false);
    }
  }

  async function handleCancelAvailability(slot) {
    setPageError('');
    setSuccess('');
    try {
      await cancelAvailability(slot.id);
      setSuccess('El horario se canceló correctamente.');
      await refresh();
    } catch (error) {
      setPageError(error.message ?? 'No se pudo cancelar el horario.');
    }
  }

  return (
    <section className="page-stack clinic-management">
      <div className="page-header">
        <div>
          <p className="eyebrow">Administración de agenda</p>
          <h1>Clínicas y horarios</h1>
          <p className="clinic-management__description">
            Registra los centros de atención y publica horarios para que el equipo
            pueda programar las solicitudes de exámenes.
          </p>
        </div>
      </div>

      <section className="clinic-management__staff-entry" aria-label="Personal médico">
        <div>
          <h2>Personal médico</h2>
          <p>Registra profesionales y asígnalos a una clínica para habilitar el registro de evaluaciones.</p>
        </div>
        <Link className="button button-secondary" to={ROUTES.medicalStaff}>
          Gestionar profesionales
        </Link>
      </section>

      {pageError ? <p className="alert alert-error" role="alert">{pageError}</p> : null}
      {success ? <p className="alert alert-success" role="status">{success}</p> : null}

      <section className="clinic-management__section" aria-labelledby="clinic-form-title">
        <div className="clinic-management__section-heading">
          <div>
            <p className="eyebrow">Paso 1</p>
            <h2 id="clinic-form-title">Registrar clínica</h2>
            <p>La información de contacto es opcional; el NIT y el nombre son obligatorios.</p>
          </div>
        </div>
        <form className="form clinic-management__form" onSubmit={handleCreateClinic}>
          <div className="clinic-management__fields">
            <Field label="NIT">
              <input required maxLength={20} value={clinicForm.nit} onChange={(event) => setClinicForm({ ...clinicForm, nit: event.target.value })} />
            </Field>
            <Field label="Nombre de la clínica">
              <input required maxLength={150} value={clinicForm.nombre} onChange={(event) => setClinicForm({ ...clinicForm, nombre: event.target.value })} />
            </Field>
            <Field label="Ciudad">
              <input maxLength={100} value={clinicForm.ciudad} onChange={(event) => setClinicForm({ ...clinicForm, ciudad: event.target.value })} />
            </Field>
            <Field label="Dirección">
              <input maxLength={250} value={clinicForm.direccion} onChange={(event) => setClinicForm({ ...clinicForm, direccion: event.target.value })} />
            </Field>
            <Field label="Correo electrónico">
              <input type="email" maxLength={254} value={clinicForm.correo} onChange={(event) => setClinicForm({ ...clinicForm, correo: event.target.value })} />
            </Field>
            <Field label="Teléfono">
              <input type="tel" maxLength={30} value={clinicForm.telefono} onChange={(event) => setClinicForm({ ...clinicForm, telefono: event.target.value })} />
            </Field>
          </div>
          {clinicError ? <p className="alert alert-error" role="alert">{clinicError}</p> : null}
          <div className="clinic-management__actions">
            <Button type="submit" disabled={isSavingClinic}>
              {isSavingClinic ? 'Guardando clínica...' : 'Registrar clínica'}
            </Button>
          </div>
        </form>
      </section>

      <section className="clinic-management__section" aria-labelledby="slot-form-title">
        <div className="clinic-management__section-heading">
          <div>
            <p className="eyebrow">Paso 2</p>
            <h2 id="slot-form-title">Publicar un horario</h2>
            <p>Los horarios deben ser futuros, durar entre 15 minutos y 8 horas, y no cruzarse con otro de la clínica.</p>
          </div>
        </div>
        {activeClinics.length === 0 ? (
          <p className="alert alert-warning" role="status">Primero registra y activa una clínica para publicar horarios.</p>
        ) : (
          <form className="form clinic-management__form" onSubmit={handleCreateAvailability}>
            <div className="clinic-management__fields clinic-management__fields--schedule">
              <Field label="Clínica">
                <select required value={slotForm.clinicaId} onChange={(event) => setSlotForm({ ...slotForm, clinicaId: event.target.value })}>
                  <option value="">Selecciona una clínica</option>
                  {activeClinics.map((clinic) => <option key={clinic.id} value={clinic.id}>{clinic.nombre}{clinic.ciudad ? ` · ${clinic.ciudad}` : ''}</option>)}
                </select>
              </Field>
              <Field label="Inicio">
                <input required type="datetime-local" min={getLocalDateTimeMinimum()} value={slotForm.inicioEn} onChange={(event) => setSlotForm({ ...slotForm, inicioEn: event.target.value })} />
              </Field>
              <Field label="Fin">
                <input required type="datetime-local" min={slotForm.inicioEn || getLocalDateTimeMinimum()} value={slotForm.finEn} onChange={(event) => setSlotForm({ ...slotForm, finEn: event.target.value })} />
              </Field>
            </div>
            {slotError ? <p className="alert alert-error" role="alert">{slotError}</p> : null}
            <div className="clinic-management__actions">
              <Button type="submit" disabled={isSavingSlot || !slotForm.clinicaId}>
                {isSavingSlot ? 'Guardando horario...' : 'Publicar horario'}
              </Button>
            </div>
          </form>
        )}
      </section>

      <section className="clinic-management__section" aria-labelledby="clinics-list-title">
        <div className="clinic-management__section-heading">
          <div><h2 id="clinics-list-title">Clínicas registradas</h2><p>Las clínicas inactivas no aparecen como opción para nuevas citas.</p></div>
          <span className="clinic-management__count">{clinics.length} {clinics.length === 1 ? 'clínica' : 'clínicas'}</span>
        </div>
        {isLoading ? <p role="status">Cargando clínicas...</p> : (
          <DataTable rows={clinics} emptyMessage="Todavía no hay clínicas registradas." columns={[
            { key: 'nombre', header: 'Clínica' },
            { key: 'nit', header: 'NIT' },
            { key: 'ciudad', header: 'Ciudad', render: (clinic) => clinic.ciudad || '—' },
            { key: 'activa', header: 'Estado', render: (clinic) => <StatusBadge value={clinic.activa ? 'Activa' : 'Inactiva'} /> },
            { key: 'acciones', header: 'Acción', render: (clinic) => <Button variant="secondary" onClick={() => void handleClinicStatus(clinic)}>{clinic.activa ? 'Desactivar' : 'Activar'}</Button> },
          ]} />
        )}
      </section>

      <section className="clinic-management__section" aria-labelledby="availability-list-title">
        <div className="clinic-management__section-heading">
          <div><h2 id="availability-list-title">Próximos horarios</h2><p>Solo se pueden cancelar horarios disponibles sin una cita asignada.</p></div>
          <span className="clinic-management__count">{availability.length} {availability.length === 1 ? 'horario' : 'horarios'}</span>
        </div>
        {isLoading ? <p role="status">Cargando horarios...</p> : (
          <DataTable rows={availability} emptyMessage="Todavía no hay horarios futuros." columns={[
            { key: 'clinica', header: 'Clínica', render: (slot) => slot.ciudad ? `${slot.clinica} · ${slot.ciudad}` : slot.clinica },
            { key: 'inicioEn', header: 'Inicio', render: (slot) => formatDateTime(slot.inicioEn) },
            { key: 'finEn', header: 'Fin', render: (slot) => formatDateTime(slot.finEn) },
            { key: 'estado', header: 'Estado', render: (slot) => <StatusBadge value={slot.estado === 'DISPONIBLE' ? 'Disponible' : slot.estado === 'RESERVADA' ? 'Reservada' : slot.estado} /> },
            { key: 'acciones', header: 'Acción', render: (slot) => slot.estado === 'DISPONIBLE' ? <Button variant="secondary" onClick={() => void handleCancelAvailability(slot)}>Cancelar</Button> : '—' },
          ]} />
        )}
      </section>
    </section>
  );
}
