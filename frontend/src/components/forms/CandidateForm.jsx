import { useState } from "react";
import Button from "../ui/Button";
import Field from "../ui/Field";
import { validateCandidate } from "../../utils/validators";

const initialValues = {
  fullName: "",
  documentNumber: "",
  email: "",
  company: ""
};

export default function CandidateForm({ onCreate }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateCandidate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onCreate(values);
      setValues(initialValues);
    }
  }

  return (
    <form className="form compact-form" onSubmit={handleSubmit}>
      <Field label="Nombre completo" error={errors.fullName}>
        <input name="fullName" value={values.fullName} onChange={handleChange} />
      </Field>
      <Field label="Documento" error={errors.documentNumber}>
        <input name="documentNumber" value={values.documentNumber} onChange={handleChange} />
      </Field>
      <Field label="Correo" error={errors.email}>
        <input name="email" value={values.email} onChange={handleChange} />
      </Field>
      <Field label="Empresa" error={errors.company}>
        <input name="company" value={values.company} onChange={handleChange} />
      </Field>
      <Button type="submit">Registrar candidato</Button>
    </form>
  );
}
