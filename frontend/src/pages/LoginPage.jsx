import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoginForm from "../components/forms/LoginForm";
import { ROUTES } from "../constants/routes";
import { loginWithCredentials, loginWithGoogle } from "../services/authService";

export default function LoginPage() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? ROUTES.dashboard;
  const googleButtonRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId || !googleButtonRef.current) return undefined;

    async function handleGoogleResponse(response) {
      if (!response.credential) return;

      setStatus("loading");
      setError(null);
      setSuccess("");

      try {
        await loginWithGoogle(response.credential);
        setStatus("authenticated");

        if (redirectTo === ROUTES.dashboard) {
          setSuccess(
            "Inicio de sesion con Google correcto. El panel se habilitara en una etapa posterior."
          );
        } else {
          navigate(redirectTo, { replace: true });
        }
      } catch (loginError) {
        setStatus("error");
        setError(loginError.message);
      }
    }

    function initializeGoogleButton() {
      if (!window.google || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        locale: "es"
      });
    }

    const script = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    );

    if (window.google) {
      initializeGoogleButton();
    } else {
      script?.addEventListener("load", initializeGoogleButton);
    }

    return () => script?.removeEventListener("load", initializeGoogleButton);
  }, [navigate, redirectTo]);

  async function handleLogin(values) {
    setStatus("loading");
    setError(null);
    setSuccess("");

    try {
      await loginWithCredentials(values);
      setStatus("authenticated");

      if (redirectTo === ROUTES.dashboard) {
        setSuccess(
          "Inicio de sesion correcto. El panel se habilitara en una etapa posterior."
        );
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (loginError) {
      setStatus("error");
      setError(loginError.message);
    }
  }

  return (
    <div className="auth-card">
      <Link className="auth-home-link" to="/">
        ← Volver al inicio
      </Link>
      <h2>Inicio de sesion</h2>
      <p>Acceso seguro por usuario, contrasena y rol.</p>
      <LoginForm
        onSubmit={handleLogin}
        error={error}
        loading={status === "loading"}
      />
      {success ? <div className="alert alert-success">{success}</div> : null}
      <div ref={googleButtonRef} className="google-sign-in-button" />
    </div>
  );
}
