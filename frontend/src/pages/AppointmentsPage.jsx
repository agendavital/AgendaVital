import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import DataTable from "../components/ui/DataTable";
import Field from "../components/ui/Field";
import StatusBadge from "../components/ui/StatusBadge";
import {
  createAppointment,
  getAppointmentAvailability,
  getAppointmentOptions,
  getAppointments,
} from "../services/appointmentsService";
import "../styles/appointments.css";

const emptyOptions = {
  examRequests: [],
  clinics: [],
  initialStatusConfigured: false,
};

function getTodayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getLocalDayRange(date) {
  const from = new Date(`${date}T00:00:00`);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AppointmentsPage() {
  const [options, setOptions] = useState(emptyOptions);
  const [appointments, setAppointments] = useState([]);
  const [examRequestId, setExamRequestId] = useState("");
  const [clinicId, setClinicId] = useState("");
  const [date, setDate] = useState(getTodayLocalDate);
  const [availabilityId, setAvailabilityId] = useState("");
  const [slots, setSlots] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optionsError, setOptionsError] = useState("");
  const [appointmentsError, setAppointmentsError] = useState("");
  const [slotsError, setSlotsError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function refreshAppointments() {
    setAppointments(await getAppointments());
    setAppointmentsError("");
  }

  useEffect(() => {
    let isMounted = true;

    Promise.all([getAppointmentOptions(), getAppointments()])
      .then(([formOptions, rows]) => {
        if (!isMounted) return;
        setOptions(formOptions);
        setAppointments(rows);
      })
      .catch((error) => {
        if (isMounted) {
          const message = error.message ?? "No se pudo cargar la agenda.";
          setOptionsError(message);
          setAppointmentsError(message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingOptions(false);
          setIsLoadingAppointments(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setAvailabilityId("");
    setSlots([]);
    setSlotsError("");
    if (!clinicId || !date) return undefined;

    let isCurrentRequest = true;
    setIsLoadingSlots(true);
    const range = getLocalDayRange(date);

    getAppointmentAvailability({ clinicId, ...range })
      .then((data) => {
        if (isCurrentRequest) setSlots(data);
      })
      .catch((error) => {
        if (isCurrentRequest) {
          setSlotsError(error.message ?? "No se pudieron cargar los horarios.");
        }
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoadingSlots(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [clinicId, date]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const created = await createAppointment({
        examRequestId,
        availabilityId,
      });
      setSuccessMessage(
        `Cita programada para ${created.candidateName} el ${formatDateTime(created.startsAt)}.`,
      );
      setExamRequestId("");
      setClinicId("");
      setDate(getTodayLocalDate());
      setAvailabilityId("");
      setSlots([]);

      try {
        await Promise.all([
          refreshAppointments(),
          getAppointmentOptions().then(setOptions),
        ]);
      } catch (error) {
        setAppointmentsError(
          error.message ??
            "La cita se creó, pero no se pudo actualizar la agenda.",
        );
      }
    } catch (error) {
      setSubmitError(error.message ?? "No se pudo programar la cita.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasRequests = options.examRequests.length > 0;
  const hasClinics = options.clinics.length > 0;
  const canBook = hasRequests && hasClinics && options.initialStatusConfigured;

  return (
    <section className="page-stack">
      <div className="page-header">
        <div>
          <p className="eyebrow">Agenda médica</p>
          <h1>Citas ocupacionales</h1>
          <p className="appointments-page__description">
            Programa una solicitud pendiente en una clínica y un horario
            disponible.
          </p>
        </div>
      </div>

      <form className="form appointments-form" onSubmit={handleSubmit}>
        <div className="appointments-form__heading">
          <p className="eyebrow">Nueva cita</p>
          <h2>Seleccionar atención y horario</h2>
          <p>
            La solicitud y la disponibilidad se validan nuevamente al confirmar
            para evitar reservas duplicadas.
          </p>
        </div>

        {isLoadingOptions ? (
          <p role="status">Cargando solicitudes y clínicas disponibles...</p>
        ) : null}

        {optionsError ? (
          <p className="alert alert-error" role="alert">
            {optionsError}
          </p>
        ) : null}

        {!isLoadingOptions && !optionsError && !hasRequests ? (
          <p className="alert alert-warning" role="status">
            No hay solicitudes pendientes de programación. Primero registra una
            solicitud en Exámenes.
          </p>
        ) : null}

        {!isLoadingOptions && !optionsError && !hasClinics ? (
          <p className="alert alert-warning" role="status">
            No hay clínicas con horarios futuros disponibles. Deben registrarse
            clínicas activas y cargar sus horarios para habilitar la agenda.
          </p>
        ) : null}

        {!isLoadingOptions && !options.initialStatusConfigured ? (
          <p className="alert alert-warning" role="status">
            Falta configurar el estado inicial “Programada” para las citas.
          </p>
        ) : null}

        {canBook ? (
          <>
            <Field label="Solicitud de examen">
              <select
                required
                value={examRequestId}
                onChange={(event) => setExamRequestId(event.target.value)}
              >
                <option value="">Selecciona una solicitud pendiente</option>
                {options.examRequests.map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.candidateName} · {request.examType} ·{" "}
                    {request.company}
                  </option>
                ))}
              </select>
            </Field>

            <div className="appointments-form__row">
              <Field label="Clínica">
                <select
                  required
                  value={clinicId}
                  onChange={(event) => setClinicId(event.target.value)}
                >
                  <option value="">Selecciona una clínica</option>
                  {options.clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                      {clinic.city ? ` · ${clinic.city}` : ""}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Fecha de atención">
                <input
                  required
                  type="date"
                  min={getTodayLocalDate()}
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                />
              </Field>
            </div>

            {clinicId ? (
              <fieldset className="appointments-slots">
                <legend>Horarios disponibles</legend>
                {isLoadingSlots ? (
                  <p role="status">Consultando disponibilidad...</p>
                ) : null}
                {slotsError ? (
                  <p className="alert alert-error" role="alert">
                    {slotsError}
                  </p>
                ) : null}
                {!isLoadingSlots && !slotsError && slots.length === 0 ? (
                  <p className="appointments-slots__empty">
                    No hay horarios disponibles para esta clínica en la fecha
                    seleccionada.
                  </p>
                ) : null}
                {slots.length > 0 ? (
                  <div className="appointments-slots__options">
                    {slots.map((slot) => (
                      <label
                        className="appointments-slots__option"
                        key={slot.id}
                      >
                        <input
                          required
                          type="radio"
                          name="availabilityId"
                          value={slot.id}
                          checked={availabilityId === slot.id}
                          onChange={() => setAvailabilityId(slot.id)}
                        />
                        <span>
                          {formatDateTime(slot.startsAt)}
                          {slot.professionalName
                            ? ` · ${slot.professionalName}`
                            : ""}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : null}
              </fieldset>
            ) : null}

            {submitError ? (
              <p className="alert alert-error" role="alert">
                {submitError}
              </p>
            ) : null}

            <div className="appointments-form__actions">
              <Button
                type="submit"
                disabled={
                  isSubmitting || !examRequestId || !clinicId || !availabilityId
                }
              >
                {isSubmitting ? "Programando cita..." : "Confirmar cita"}
              </Button>
            </div>
          </>
        ) : null}
      </form>

      {successMessage ? (
        <p className="alert alert-success" role="status">
          {successMessage}
        </p>
      ) : null}

      <section
        className="appointments-list"
        aria-labelledby="appointments-list-title"
      >
        <div className="appointments-list__heading">
          <div>
            <h2 id="appointments-list-title">Citas programadas</h2>
            <p>Consulta la clínica, el examen y el horario asignado.</p>
          </div>
          <span className="appointments-list__count">
            {appointments.length} {appointments.length === 1 ? "cita" : "citas"}
          </span>
        </div>

        {isLoadingAppointments ? <p role="status">Cargando citas...</p> : null}
        {appointmentsError ? (
          <p className="alert alert-error" role="alert">
            {appointmentsError}
          </p>
        ) : null}
        {!isLoadingAppointments &&
        (!appointmentsError || appointments.length > 0) ? (
          <DataTable
            rows={appointments}
            emptyMessage="Todavía no hay citas programadas."
            columns={[
              { key: "candidateName", header: "Candidato" },
              { key: "document", header: "Documento" },
              { key: "examType", header: "Examen" },
              {
                key: "clinic",
                header: "Clínica",
                render: (appointment) =>
                  appointment.city
                    ? `${appointment.clinic} · ${appointment.city}`
                    : appointment.clinic,
              },
              {
                key: "startsAt",
                header: "Fecha y hora",
                render: (appointment) => formatDateTime(appointment.startsAt),
              },
              {
                key: "status",
                header: "Estado",
                render: (appointment) => (
                  <StatusBadge value={appointment.status} />
                ),
              },
            ]}
          />
        ) : null}
      </section>
    </section>
  );
}
