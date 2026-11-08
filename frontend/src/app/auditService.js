import { auditLogs } from "./mockData";

let auditStore = [...auditLogs];

export function registerAudit(actor, action, risk = "Medio") {
  auditStore = [
    { id: Date.now(), actor, action, risk, date: new Date().toISOString() },
    ...auditStore
  ];
}

export async function listAuditLogs() {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return auditStore;
}
