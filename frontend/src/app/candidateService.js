import { candidates } from "./mockData";

let candidateStore = [...candidates];

export async function listCandidates() {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return candidateStore;
}

export async function createCandidate(candidate) {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const created = {
    ...candidate,
    id: Date.now(),
    status: "Registrado",
    concept: "Pendiente"
  };
  candidateStore = [created, ...candidateStore];
  return created;
}
