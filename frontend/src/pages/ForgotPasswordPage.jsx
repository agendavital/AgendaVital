import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import { ROUTES } from "../constants/routes";
import { requestPasswordRecovery } from "../services/authService";
import { isEmail } from "../utils/validators";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isEmail(email)) {
      setError("Ingrese un correo valido.");
      return;
    }
    setError("");
    const response = await requestPasswordRecovery(email);
    setMessage(response.message);
  }

  return (
    <div className="auth-card">
      <h2>Recuperar contrasena</h2>
      <p>El enlace de recuperacion debe expirar y usarse una sola vez en backend.</p>
      <form className="form" onSubmit={handleSubmit}>
        <Field label="Correo electronico" error={error}>
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        {message ? <div className="alert alert-success">{message}</div> : null}
        <Button type="submit">Enviar instrucciones</Button>
        <Link className="link" to={ROUTES.login}>Volver al inicio de sesion</Link>
      </form>
    </div>
  );
}
