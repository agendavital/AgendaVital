import { ROLES } from "../constants/roles";

export const users = [
  { id: 1, name: "Ana Torres", email: "admin@agendavital.com", role: ROLES.ADMIN, password: "Admin123" },
  { id: 2, name: "Carlos Rojas", email: "rh@empresa.com", role: ROLES.HR, password: "Rh123456" },
  { id: 3, name: "Claudia Vega", email: "clinica@ocupacional.com", role: ROLES.CLINIC, password: "Clinica123" },
  { id: 4, name: "Dr. Luis Medina", email: "medico@ocupacional.com", role: ROLES.DOCTOR, password: "Medico123" },
  { id: 5, name: "Maria Gomez", email: "candidato@email.com", role: ROLES.CANDIDATE, password: "Candidato123" }
];

export const candidates = [
  {
    id: 101,
    fullName: "Maria Gomez",
    documentNumber: "1002456789",
    email: "candidato@email.com",
    company: "Industrias Norte",
    status: "En proceso",
    concept: "Pendiente"
  },
  {
    id: 102,
    fullName: "Jorge Perez",
    documentNumber: "80123456",
    email: "jorge@email.com",
    company: "Logistica Andina",
    status: "Finalizado",
    concept: "Apto con restricciones"
  }
];

export const appointments = [
  { id: 201, candidate: "Maria Gomez", doctor: "Dr. Luis Medina", date: "2026-06-18T09:00:00", status: "Programada" },
  { id: 202, candidate: "Jorge Perez", doctor: "Dr. Luis Medina", date: "2026-06-19T11:30:00", status: "Pendiente resultados" }
];

export const documents = [
  { id: 301, owner: "Maria Gomez", type: "Documento de identidad", status: "Verificado", sensitive: false },
  { id: 302, owner: "Jorge Perez", type: "Historia clinica ocupacional", status: "Restringido", sensitive: true }
];

export const auditLogs = [
  { id: 401, actor: "Ana Torres", action: "Inicio de sesion", date: "2026-06-16T19:00:00", risk: "Bajo" },
  { id: 402, actor: "Dr. Luis Medina", action: "Registro resultado medico", date: "2026-06-16T19:10:00", risk: "Alto" }
];
