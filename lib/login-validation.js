const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginForm({ email, password }) {
  const errors = {};

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    errors.email = "Email is required";
  } else if (!EMAIL_RE.test(trimmedEmail)) {
    errors.email = "Enter a valid email address";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
