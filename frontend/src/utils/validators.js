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

  if (!required(values.firstName)) {
    errors.firstName = "El nombre es obligatorio.";
  } else if (values.firstName.trim().length > 100) {
    errors.firstName = "El nombre no puede superar 100 caracteres.";
  }

  if(!required(values.lastName)) {
    errors.lastName = "El apellido es obligatorio.";
  } else if (values.lastName.trim().length > 100) {
    errors.lastName = "El apellido no puede superar 100 caracteres.";
  }

  if (!isEmail(values.email)) {
    errors.email = "Ingrese un correo electrónico válido.";
  }

  if(!required(values.documentType)) {
    errors.documentType = "Selecciona un tipo de documento.";
  } else if (values.documentType.length > 10) {
    errors.documentType = "El tipo de documento no puede superar 10 caracteres"
  }

  if (!required(values.documentNumber)) {
    errors.documentNumber = "El número de documento es obligatorio.";
  } else if (values.documentNumber.trim().length > 30) {
    errors.documentNumber = "El documento no puede superar 30 caracteres.";
  }

  return errors;
}
