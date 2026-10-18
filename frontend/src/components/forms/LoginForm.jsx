import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import Field from "../ui/Field";
import { validateLogin } from "../../utils/validators";
import { ROUTES } from "../../constants/routes";

export default function LoginForm({ onSubmit, error, loading }) {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  function handleChange(event) {
    setValues({ ...values, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) onSubmit(values);
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Field label="Correo electronico" error={errors.email}>
        <input name="email" value={values.email} onChange={handleChange} autoComplete="email" />
      </Field>
      <Field label="Contrasena" error={errors.password}>
        <input
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          autoComplete="current-password"
        />
      </Field>
      {error ? <div className="alert alert-error">{error}</div> : null}
      <Button type="submit" disabled={loading}>{loading ? "Validando..." : "Ingresar"}</Button>
      <Link className="link" to={ROUTES.forgotPassword}>Recuperar contrasena</Link>
    </form>
  );
}
