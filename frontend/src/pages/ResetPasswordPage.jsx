import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Field from "../components/ui/Field";
import { ROUTES } from "../constants/routes";
import { resetPassword } from "../services/authService";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token")?.trim() ?? "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setMessage("");

        if(!token) {
            setError("El enlace no contiene un token válido.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await resetPassword({ token, password });
            setMessage(response.message);
        } catch (requestError) {
            setError(requestError.message || "No se pudo actualizar la contraseña.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="auth-card">
            <h2>Crear una nueva contraseña</h2>
            <p>Ingrese una contraseña nueva.</p>

            {!token ? (
                <div className="alert alert-error">
                    El enlace no es valido. Solicita uno nuevo desde "Recuperar contraseña".
                </div>
            ) : (
                <form className="form" onSubmit={handleSubmit}>
                    <Field label="Nueva contraseña">
                        <input
                            type="password"
                            autoComplete="new-password"
                            minLength={6}
                            required
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </Field>
                    
                    <Field label="confirmar contraseña">
                    <input
                        label="password"
                        autoComplete="new-password"
                        minLength={6}
                        required
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                    </Field>
                    
                    {error ? <div className="alert alert-error">{error}</div> : null}
                    {message ? <div className="alert alert-success">{message}</div> : null}

                    <Button type="submit" disabled={isSubmitting || Boolean(message)}>
                        {isSubmitting ? "Actualizando..." : "Actualizar contraseña"}
                    </Button>
                </form>
            )}

            <Link className="link" to={ROUTES.login}>
                Volver al inicio de Sesión
            </Link>
        </div>
    );
}