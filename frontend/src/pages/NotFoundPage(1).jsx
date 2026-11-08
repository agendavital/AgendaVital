import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes";

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <h1>Pagina no encontrada</h1>
      <Link className="link" to={ROUTES.dashboard}>Volver al panel</Link>
    </main>
  );
}
