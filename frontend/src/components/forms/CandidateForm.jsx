import { useState } from "react";
import Button from "../ui/Button";
import Field from "../ui/Field";
import { validateCandidate } from "../../utils/validators";
import "../../styles/candidates.css";

const initialValues = {
  firstName: "",
  lastName: "",
  email: "",
  documentType: "",
  documentNumber: ""
};

export default function CandidateForm({ onCreate, isSubmitting = false }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    const { name, value } = event.target;

    setValues((currentValues) => ({ 
      ...currentValues, 
      [name]: value 
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateCandidate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const created = await onCreate(values);

    if (created) {
      setValues(initialValues);
      setErrors({});
    }
  }

   return (
    <form className="form candidate-form" onSubmit={handleSubmit}>
      <div className="candidate-form__heading">
        <p className="eyebrow">Nuevo registro</p>
        <h2>Datos del candidato</h2>
        <p>Ingresa la información de identificación y contacto para iniciar su proceso.</p>
      </div>

      <div className="candidate-form__fields">
        <Field label="Nombre" error={errors.firstName}>
          <input
            name="firstName"
            value={values.firstName}
            onChange={handleChange}
            maxLength={100}
            autoComplete="given-name"
          />
        </Field>

        <Field label="Apellido" error={errors.lastName}>
          <input
            name="lastName"
            value={values.lastName}
            onChange={handleChange}
            maxLength={100}
            autoComplete="family-name"
          />
        </Field>

        <Field label="Tipo de documento" error={errors.documentType}>
          <select
            name="documentType"
            value={values.documentType}
            onChange={handleChange}
          >
            <option value="">Selecciona un tipo</option>
            <option value="CC">Cédula de ciudadanía</option>
            <option value="TI">Tarjeta de identidad</option>
            <option value="CE">Cédula de extranjería</option>
            <option value="PPT">Permiso por protección temporal</option>
            <option value="PASAPORTE">Pasaporte</option>
          </select>
        </Field>

        <Field label="Número de documento" error={errors.documentNumber}>
          <input
            type="text"
            name="documentNumber"
            value={values.documentNumber}
            onChange={handleChange}
            maxLength={30}
            autoComplete="off"
          />
        </Field>

        <div className="candidate-form__field--wide">
          <Field label="Correo electrónico" error={errors.email}>
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              maxLength={254}
              autoComplete="email"
            />
          </Field>
        </div>
      </div>

      <div className="candidate-form__actions">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creando..." : "Crear candidato"}
        </Button>
      </div>
    </form>
  );
}
