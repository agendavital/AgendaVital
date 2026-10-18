export function required(value) {
  return String(value ?? "").trim().length > 0;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isStrongPassword(value) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value);
}

export function validateLogin(values) {
  const errors = {};
  if (!isEmail(values.email)) errors.email = "Ingrese un correo valido.";
  if (!required(values.password)) errors.password = "La contrasena es obligatoria.";
  return errors;
}

export function validateCandidate(values) {
  const errors = {};
  if (!required(values.fullName)) errors.fullName = "El nombre es obligatorio.";
  if (!required(values.documentNumber)) errors.documentNumber = "El documento es obligatorio.";
  if (!isEmail(values.email)) errors.email = "Ingrese un correo valido.";
  if (!required(values.company)) errors.company = "La empresa es obligatoria.";
  return errors;
}
