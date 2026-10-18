import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes";

const benefits = [
  {
    icon: "📅",
    title: "Gestion de citas medicas",
    description:
      "Agenda, modifica y cancela citas desde cualquier dispositivo. Recordatorios automaticos para reducir el ausentismo."
  },
  {
    icon: "🩺",
    title: "Historial medico centralizado",
    description:
      "Accede al historial completo de cada colaborador: examenes, diagnosticos y evolucion clinica en un solo lugar."
  },
  {
    icon: "🔐",
    title: "Seguridad y roles de acceso",
    description:
      "Control de acceso por roles: medicos, administradores y empleados ven solo lo que les corresponde."
  },
  {
    icon: "📊",
    title: "Reportes administrativos",
    description:
      "Genera informes de ausentismo, cumplimiento de examenes periodicos y estadisticas de salud en segundos."
  },
  {
    icon: "🔔",
    title: "Notificaciones inteligentes",
    description:
      "Alertas automaticas por correo cuando una cita se acerca, se modifica o cuando vencen examenes obligatorios."
  },
  {
    icon: "🌐",
    title: "Acceso 24/7 desde cualquier lugar",
    description:
      "Plataforma web responsive: funciona en computador, tablet y celular sin instalar nada."
  }
];

const testimonials = [
  {
    initials: "CR",
    name: "Carolina Rios",
    role: "Coordinadora SST - Manufacturas del Valle",
    gradient: "linear-gradient(135deg, #0D6E4E, #1A9B6C)",
    text:
      "Antes llevabamos todo en Excel y se nos perdian los examenes vencidos. Con Agenda Vital tenemos alertas automaticas y los reportes se generan en un clic."
  },
  {
    initials: "AM",
    name: "Andres Martinez",
    role: "Gerente RRHH - Logistica Andina S.A.S",
    gradient: "linear-gradient(135deg, #1a3a5c, #3B82F6)",
    text:
      "La gestion de roles fue clave para nosotros. Los medicos acceden solo a lo clinico y el area de RR.HH. a los reportes. Todo muy ordenado y seguro."
  },
  {
    initials: "LP",
    name: "Lucia Palomino",
    role: "Medica Ocupacional - Clinica Central Norte",
    gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)",
    text:
      "Implementamos Agenda Vital en dos semanas. El equipo de soporte estuvo disponible en todo momento y la capacitacion fue muy sencilla."
  }
];

const faqs = [
  {
    question: "Cuanto cuesta Agenda Vital?",
    answer:
      "Ofrecemos planes adaptados al tamano de tu empresa. Contactanos para recibir una cotizacion personalizada sin costo. La demo inicial es completamente gratuita."
  },
  {
    question: "Como se protege el historial medico de los empleados?",
    answer:
      "Toda la informacion se almacena cifrada y solo es accesible por usuarios autorizados segun su rol. El diseno contempla buenas practicas de proteccion de datos personales y confidencialidad medica."
  },
  {
    question: "Necesito instalar algo en mis equipos?",
    answer:
      "No. Agenda Vital es una plataforma 100% web. Solo necesitas un navegador moderno y conexion a internet. Tambien funciona desde dispositivos moviles."
  },
  {
    question: "Puedo migrar la informacion de mis sistemas actuales?",
    answer:
      "Si. La arquitectura propuesta permite preparar procesos de migracion desde Excel u otros sistemas manteniendo validacion y trazabilidad."
  },
  {
    question: "Cuanto tiempo toma la implementacion?",
    answer:
      "El tiempo promedio de implementacion inicial es de 1 a 2 semanas, dependiendo del tamano de la empresa, datos historicos y configuracion requerida."
  }
];

const initialForm = {
  nombre: "",
  empresa: "",
  correo: "",
  telefono: "",
  mensaje: ""
};

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validateForm() {
    const nextErrors = {};
    if (form.nombre.trim().length < 3) nextErrors.nombre = "Por favor ingresa tu nombre.";
    if (form.empresa.trim().length < 2) nextErrors.empresa = "Por favor ingresa el nombre de tu empresa.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
      nextErrors.correo = "Ingresa un correo electronico valido.";
    }
    if (form.mensaje.trim().length < 10) {
      nextErrors.mensaje = "Por favor describe brevemente tu necesidad.";
    }
    return nextErrors;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setSent(true);
      setForm(initialForm);
    }
  }

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <a href="#hero" className="landing-logo" onClick={closeMenu}>
          Agenda<span>Vital</span>
        </a>
        <div className="landing-nav-links">
          <a href="#beneficios">Beneficios</a>
          <a href="#prueba-social">Empresas</a>
          <a href="#faq">FAQ</a>
          <a href="#contacto" className="landing-nav-cta">Solicitar demo</a>
          <Link to={ROUTES.login} className="landing-login-link">Ingresar</Link>
        </div>
        <button
          className={`landing-hamburger ${menuOpen ? "open" : ""}`}
          aria-label="Abrir menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className={`landing-mobile-menu ${menuOpen ? "open" : ""}`}>
          <a href="#beneficios" onClick={closeMenu}>Beneficios</a>
          <a href="#prueba-social" onClick={closeMenu}>Empresas</a>
          <a href="#faq" onClick={closeMenu}>FAQ</a>
          <a href="#contacto" className="landing-nav-cta" onClick={closeMenu}>Solicitar demo</a>
          <Link to={ROUTES.login} className="landing-login-link" onClick={closeMenu}>Ingresar</Link>
        </div>
      </nav>

      <section id="hero" className="landing-hero">
        <div className="hero-texto">
          <span className="hero-eyebrow">Salud ocupacional digital</span>
          <h1 className="hero-titulo">
            Gestiona la salud de tu equipo de forma <em>inteligente</em>
          </h1>
          <p className="hero-subtitulo">
            Agenda Vital centraliza las citas medicas ocupacionales, el historial clinico
            y los reportes administrativos de tu empresa en una sola plataforma segura.
          </p>
          <div className="hero-btns">
            <a href="#contacto" className="btn-primario">Solicitar una demo gratuita</a>
            <a href="#beneficios" className="btn-secundario">Ver beneficios</a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card">
            <div className="hc-header">
              <div className="hc-avatar">M</div>
              <div>
                <div className="hc-name">Maria Rodriguez</div>
                <div className="hc-role">Medico Ocupacional</div>
              </div>
            </div>
            <div className="cita-item">
              <span className="cita-label">Juan Perez - Examen periodico</span>
              <span className="cita-badge badge-verde">Confirmada</span>
            </div>
            <div className="cita-item">
              <span className="cita-label">Ana Gomez - Audiometria</span>
              <span className="cita-badge badge-azul">Pendiente</span>
            </div>
            <div className="cita-item">
              <span className="cita-label">Luis Torres - Visio examen</span>
              <span className="cita-badge badge-gris">Programada</span>
            </div>
            <div className="hc-stats">
              <div className="hc-stat">
                <div className="hc-stat-num">12</div>
                <div className="hc-stat-label">Citas hoy</div>
              </div>
              <div className="hc-stat">
                <div className="hc-stat-num">98%</div>
                <div className="hc-stat-label">Asistencia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="landing-section beneficios-section">
        <span className="etiqueta-seccion">Por que Agenda Vital?</span>
        <h2 className="titulo-seccion">Todo lo que necesita tu empresa</h2>
        <p className="subtitulo-seccion">
          Disenado para equipos de salud ocupacional que quieren dejar atras las hojas de calculo
          y los procesos manuales.
        </p>
        <div className="beneficios-grid">
          {benefits.map((benefit) => (
            <article className="beneficio-card" key={benefit.title}>
              <div className="beneficio-icono">{benefit.icon}</div>
              <h3 className="beneficio-titulo">{benefit.title}</h3>
              <p className="beneficio-desc">{benefit.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="prueba-social" className="landing-section social-section">
        <span className="etiqueta-seccion">Empresas que confian en nosotros</span>
        <h2 className="titulo-seccion">Resultados que hablan por si solos</h2>
        <p className="subtitulo-seccion">
          Mas de 50 empresas en Colombia han transformado su gestion de salud ocupacional con Agenda Vital.
        </p>
        <div className="stats-row">
          <Stat value="500+" label="Citas gestionadas por mes" />
          <Stat value="98%" label="Satisfaccion de usuarios" />
          <Stat value="50+" label="Empresas activas" />
          <Stat value="40%" label="Reduccion de ausentismo" />
        </div>
        <div className="testimonios-grid">
          {testimonials.map((testimonial) => (
            <article className="testimonio-card" key={testimonial.name}>
              <p className="testimonio-texto">"{testimonial.text}"</p>
              <div className="testimonio-autor">
                <div className="autor-avatar" style={{ background: testimonial.gradient }}>{testimonial.initials}</div>
                <div>
                  <div className="autor-nombre">{testimonial.name}</div>
                  <div className="autor-cargo">{testimonial.role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="contacto" className="landing-section contacto-section">
        <div className="contacto-inner">
          <div>
            <span className="etiqueta-seccion">Solicita tu demo</span>
            <h2 className="titulo-seccion">Hablemos sobre tu empresa</h2>
            <p className="subtitulo-seccion">
              Completa el formulario y un especialista de Agenda Vital te contactara en menos de 24 horas.
            </p>
            <ul className="contacto-puntos">
              <ContactPoint icon="✅" title="Demo personalizada" text="Adaptada al tamano y sector de tu empresa" />
              <ContactPoint icon="🤝" title="Sin compromiso" text="La demo es completamente gratuita" />
              <ContactPoint icon="⏱" title="Respuesta en 24 horas" text="contacto@agendavital.co - +57 300 000 0000" />
            </ul>
          </div>

          <div>
            {sent ? (
              <div className="form-exito visible">
                <div className="exito-icono">✅</div>
                <h3 className="exito-titulo">Mensaje enviado con exito</h3>
                <p className="exito-texto">
                  Gracias por tu interes. Un especialista de Agenda Vital se comunicara contigo en menos de 24 horas.
                </p>
              </div>
            ) : (
              <form className="landing-form" noValidate onSubmit={handleSubmit}>
                <LandingField label="Nombre completo *" error={errors.nombre}>
                  <input
                    name="nombre"
                    value={form.nombre}
                    onChange={updateField}
                    placeholder="Ej: Maria Garcia"
                    className={errors.nombre ? "error" : ""}
                  />
                </LandingField>
                <LandingField label="Empresa *" error={errors.empresa}>
                  <input
                    name="empresa"
                    value={form.empresa}
                    onChange={updateField}
                    placeholder="Ej: Manufacturas del Valle"
                    className={errors.empresa ? "error" : ""}
                  />
                </LandingField>
                <LandingField label="Correo electronico *" error={errors.correo}>
                  <input
                    name="correo"
                    type="email"
                    value={form.correo}
                    onChange={updateField}
                    placeholder="correo@empresa.com"
                    className={errors.correo ? "error" : ""}
                  />
                </LandingField>
                <LandingField label="Telefono opcional">
                  <input
                    name="telefono"
                    type="tel"
                    value={form.telefono}
                    onChange={updateField}
                    placeholder="+57 300 000 0000"
                  />
                </LandingField>
                <LandingField label="Que necesitas gestionar? *" error={errors.mensaje}>
                  <textarea
                    name="mensaje"
                    value={form.mensaje}
                    onChange={updateField}
                    placeholder="Cuentanos brevemente sobre tu empresa y lo que buscas..."
                    className={errors.mensaje ? "error" : ""}
                  />
                </LandingField>
                <button type="submit" className="form-submit">Solicitar demo gratuita →</button>
              </form>
            )}
          </div>
        </div>
      </section>

      <section id="faq" className="landing-section faq-section">
        <span className="etiqueta-seccion">Preguntas frecuentes</span>
        <h2 className="titulo-seccion">Resolvemos tus dudas</h2>
        <p className="subtitulo-seccion">Si no encuentras lo que buscas, escribenos al formulario de arriba.</p>
        <div className="faq-lista">
          {faqs.map((faq, index) => {
            const active = activeFaq === index;
            return (
              <article className={`faq-item ${active ? "activo" : ""}`} key={faq.question}>
                <button className="faq-pregunta" onClick={() => setActiveFaq(active ? null : index)}>
                  {faq.question}
                  <span className="faq-icono">+</span>
                </button>
                <div className="faq-respuesta">
                  <p>{faq.answer}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <a href="#hero" className="landing-logo">Agenda<span>Vital</span></a>
            <p>
              Plataforma web para la gestion integral de salud ocupacional empresarial.
              Desarrollada por estudiantes ADSO - SENA, ficha 3223876.
            </p>
          </div>
          <div className="footer-col">
            <h4>Plataforma</h4>
            <ul>
              <li><a href="#beneficios">Beneficios</a></li>
              <li><a href="#prueba-social">Casos de exito</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contacto">Solicitar demo</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Acceso</h4>
            <ul>
              <li><Link to={ROUTES.login}>Inicio de sesion</Link></li>
              <li><Link to={ROUTES.forgotPassword}>Recuperar contrasena</Link></li>
              <li><a href="#contacto">Contacto</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Agenda Vital - Todos los derechos reservados.</p>
          <div className="footer-legal">
            <a href="#contacto">Privacidad</a>
            <a href="#contacto">Terminos</a>
            <a href="#contacto">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="stat-item">
      <div className="stat-num">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function ContactPoint({ icon, title, text }) {
  return (
    <li>
      <div className="punto-icono">{icon}</div>
      <div className="punto-texto">
        <strong>{title}</strong>
        <span>{text}</span>
      </div>
    </li>
  );
}

function LandingField({ label, error, children }) {
  return (
    <label className="form-grupo">
      <span>{label}</span>
      {children}
      <small className={`form-error ${error ? "visible" : ""}`}>{error}</small>
    </label>
  );
}
