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
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!isEmail(email.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await requestPasswordRecovery(email);
      setMessage(response.message);
    } catch (requestError) {
      setError(
        requestError.message ||
        "No se pudo procesar la solicitud. Inténtalo de nuevo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <h2>Recuperar contrasena</h2>
      <p> Si el correo pertenece a una cuenta activa, enviaremos un enlace válido
        por 15 minutos.</p>

      <form className="form" onSubmit={handleSubmit}>
        <Field label="Correo electronico">
          <input
            type="email"
            autoComplete="email"
            required 
            value={email} 
            onChange={(event) => setEmail(event.target.value)} 
            />
        </Field>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {message ? <div className="alert alert-success">{message}</div> : null}

        <Button type="submit">
          {isSubmitting ? "Enviando..." : "Enviar instrucciones"}
        </Button>
        
        <Link className="link" to={ROUTES.login}>Volver al inicio de sesion</Link>
      </form>
    </div>
  );
}
