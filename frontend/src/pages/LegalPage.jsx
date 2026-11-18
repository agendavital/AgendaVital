import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import "../styles/legal.css";

const pages = {
  [ROUTES.privacy]: {
    eyebrow: "Tratamiento responsable",
    title: "Política de privacidad",
    intro:
      "Esta página resume qué información puede tratar el prototipo AgendaVital y para qué. Antes de usarlo en operación real, el responsable del tratamiento debe completar y aprobar los datos institucionales pendientes.",
    updated: "Borrador informativo del prototipo académico",
    notice: "No ingreses datos reales de salud u otra información sensible en esta versión de demostración.",
    sections: [
      {
        id: "cookies",
        title: "Cookies de sesión y seguridad",
        body: (
          <>
            <p>Las cookies son pequeños datos que el navegador conserva para mantener una sesión o aplicar controles de seguridad. En esta versión, AgendaVital usa cookies propias de autenticación y protección CSRF; no usa cookies propias de publicidad ni analítica.</p>
            <div className="legal-table-wrap">
              <table className="legal-table">
                <thead><tr><th>Cookie</th><th>Uso</th><th>Duración</th><th>Acceso del navegador</th></tr></thead>
                <tbody>
                  <tr><td><code>agenda_vital_session</code></td><td>Mantener la sesión autenticada.</td><td>Hasta 1 hora.</td><td>HttpOnly; JavaScript no puede leerla.</td></tr>
                  <tr><td><code>agenda_vital_csrf</code></td><td>Ayudar a validar solicitudes que modifican información.</td><td>Hasta 1 hora.</td><td>Accesible al cliente para enviarla en la cabecera CSRF.</td></tr>
                </tbody>
              </table>
            </div>
            <p>Ambas usan <code>SameSite=Lax</code>. La cookie de sesión se limita a <code>/api</code>; la cookie CSRF se usa desde la raíz. En producción, ambas se transmiten con <code>Secure</code> por HTTPS. Son necesarias para iniciar sesión y proteger la cuenta: puedes borrarlas desde el navegador o cerrar sesión para eliminarlas, pero eso finalizará tu sesión.</p>
            <p>Google Identity Services y reCAPTCHA cargan servicios externos cuando se utilizan; esos servicios pueden tratar datos técnicos conforme a sus propias políticas. Si AgendaVital incorpora analítica, publicidad u otras tecnologías opcionales, esta información deberá actualizarse y se revisarán los controles correspondientes.</p>
          </>
        ),
      },
      {
        id: "responsable",
        title: "Responsable y contacto",
        body: <p>El nombre o razón social del responsable del tratamiento, su identificación, domicilio y canal para solicitudes de privacidad aún deben definirse. Esta información debe completarse antes de ofrecer AgendaVital a empresas, pacientes o trabajadores reales.</p>,
      },
      {
        id: "informacion",
        title: "Información que puede tratarse",
        body: (
          <ul>
            <li><strong>Acceso a la cuenta:</strong> correo, credenciales de acceso y datos de usuario asociados al rol. La contraseña se procesa como hash en el backend.</li>
            <li><strong>Recuperación de acceso:</strong> correo y un token temporal de recuperación; el token se guarda como hash y vence a los 15 minutos.</li>
            <li><strong>Inicio con Google y reCAPTCHA:</strong> información de autenticación y señales técnicas necesarias para verificar la solicitud, según la opción utilizada.</li>
            <li><strong>Información de los módulos:</strong> el sistema está pensado para gestionar candidatos, citas y datos ocupacionales. Esta versión académica no debe usarse para cargar información real de salud.</li>
          </ul>
        ),
      },
      {
        id: "finalidades",
        title: "Finalidades y funcionamiento de la demostración",
        body: (
          <>
            <p>La información de autenticación se usa para validar el acceso, aplicar permisos por rol, conservar la sesión y permitir su recuperación. Los servicios de Google se usan únicamente cuando eliges el acceso correspondiente o completas reCAPTCHA.</p>
            <p>El formulario de solicitud de demo de esta página muestra una confirmación local en el navegador; en la versión actual no envía sus campos a un servicio de AgendaVital.</p>
          </>
        ),
      },
      {
        id: "conservacion",
        title: "Conservación y seguridad",
        body: <p>La sesión del navegador dura hasta una hora y se elimina al cerrar sesión. Los enlaces de recuperación expiran a los 15 minutos y solo pueden utilizarse una vez. El acceso a la aplicación requiere autenticación y permisos; la cookie de sesión está protegida con HttpOnly y en producción se configura Secure. El tiempo de conservación de los demás datos y los procedimientos para su eliminación deben definirse antes de un despliegue real.</p>,
      },
      {
        id: "derechos",
        title: "Consultas y solicitudes sobre tus datos",
        body: <p>Para una operación real se habilitará un canal de contacto del responsable para recibir solicitudes de consulta, actualización, corrección o eliminación, según corresponda. Ese canal todavía está pendiente de definir para este prototipo.</p>,
      },
      {
        id: "terceros",
        title: "Servicios de terceros",
        body: <p>El proveedor de inicio de sesión de Google y reCAPTCHA procesan información bajo sus propios términos y políticas. No ingreses en estos servicios datos distintos de los necesarios para autenticarte o completar la verificación.</p>,
      },
    ],
  },
  [ROUTES.terms]: {
    eyebrow: "Uso claro y seguro",
    title: "Términos de uso",
    intro:
      "Estas condiciones describen el uso previsto de AgendaVital en su estado de prototipo académico. Deben revisarse y completarse por el responsable antes de una puesta en servicio real.",
    updated: "Borrador informativo del prototipo académico",
    notice: "AgendaVital se encuentra en desarrollo. No es un servicio clínico ni sustituye el criterio de profesionales de salud.",
    sections: [
      {
        id: "alcance",
        title: "Alcance del servicio",
        body: <p>AgendaVital es una aplicación web en desarrollo para apoyar la coordinación de procesos de salud ocupacional, como gestión de candidatos, citas, documentos, resultados y reportes. Algunas pantallas o funciones pueden estar incompletas o usar datos de demostración.</p>,
      },
      {
        id: "cuentas",
        title: "Cuentas y acceso",
        body: <p>El acceso requiere una cuenta habilitada. Cada persona debe proteger sus credenciales, cerrar su sesión en dispositivos compartidos y usar únicamente las funciones autorizadas para su rol. El administrador de la organización será responsable de asignar y retirar accesos cuando exista una implementación institucional.</p>,
      },
      {
        id: "uso-aceptable",
        title: "Uso aceptable",
        body: (
          <ul>
            <li>Usar la plataforma solo para fines autorizados y conforme a las instrucciones de la organización.</li>
            <li>No intentar acceder a cuentas, módulos o información que no correspondan al rol asignado.</li>
            <li>No cargar información real, médica o sensible en la demostración académica.</li>
            <li>No interferir con la seguridad, disponibilidad o funcionamiento de la aplicación.</li>
          </ul>
        ),
      },
      {
        id: "datos",
        title: "Información y confidencialidad",
        body: <p>Quienes operen una implementación real deberán contar con autorización para tratar la información que ingresen y limitar el acceso a las personas que la necesiten. La disponibilidad de una función en el prototipo no constituye autorización para usarla con datos reales.</p>,
      },
      {
        id: "salud",
        title: "Sin diagnóstico ni atención médica",
        body: <p>La aplicación es una herramienta de gestión. No brinda diagnósticos, recomendaciones médicas ni atención de urgencias. Las decisiones clínicas corresponden a profesionales habilitados y deben tomarse por los canales asistenciales adecuados.</p>,
      },
      {
        id: "disponibilidad",
        title: "Disponibilidad y cambios",
        body: <p>Durante el desarrollo pueden cambiar funciones, rutas o contenidos, y pueden existir interrupciones o errores. El prototipo no ofrece compromisos de disponibilidad o soporte de producción. Las condiciones definitivas, el responsable del servicio y el canal de soporte deberán publicarse antes de su uso institucional.</p>,
      },
    ],
  },
};

const legalLinks = [
  { to: ROUTES.privacy, label: "Privacidad" },
  { to: ROUTES.terms, label: "Términos" },
];

export default function LegalPage() {
  const { pathname } = useLocation();
  const page = pages[pathname] ?? pages[ROUTES.privacy];

  return (
    <main className="legal-page">
      <header className="legal-topbar">
        <Link to="/" className="legal-brand" aria-label="AgendaVital, volver al inicio">
          Agenda<span>Vital</span>
        </Link>
        <nav aria-label="Documentos legales" className="legal-top-links">
          {legalLinks.map((item) => (
            <Link key={item.to} to={item.to} aria-current={pathname === item.to ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
          <Link className="legal-login" to={ROUTES.login}>Iniciar sesión</Link>
        </nav>
      </header>

      <section className="legal-hero">
        <div className="legal-hero-content">
          <Link to="/" className="legal-back">← Volver al inicio</Link>
          <p className="legal-eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="legal-intro">{page.intro}</p>
          <span className="legal-updated">{page.updated}</span>
        </div>
      </section>

      <div className="legal-layout">
        <aside className="legal-toc" aria-label="Contenido de la página">
          <p>En esta página</p>
          {page.sections.map((section, index) => (
            <a key={section.id} href={`#${section.id}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>{section.title}
            </a>
          ))}
        </aside>

        <article className="legal-document">
          {page.notice && <div className="legal-notice"><span aria-hidden="true">i</span><p>{page.notice}</p></div>}
          {page.sections.map((section, index) => (
            <section className="legal-section" id={section.id} key={section.id}>
              <span className="legal-section-number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h2>{section.title}</h2>
                {section.body}
              </div>
            </section>
          ))}
          <div className="legal-end-card">
            <div><span className="legal-end-icon" aria-hidden="true">✓</span><div><strong>¿Necesitas volver a la aplicación?</strong><p>Continúa al inicio o ingresa a tu cuenta.</p></div></div>
            <div className="legal-end-actions"><Link to="/">Inicio</Link><Link to={ROUTES.login}>Iniciar sesión</Link></div>
          </div>
        </article>
      </div>

      <footer className="legal-footer">
        <span>AgendaVital <span aria-hidden="true">·</span> Información del prototipo</span>
        <div>{legalLinks.map((item) => <Link key={item.to} to={item.to}>{item.label}</Link>)}</div>
      </footer>
    </main>
  );
}
