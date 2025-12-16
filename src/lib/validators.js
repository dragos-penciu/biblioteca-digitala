export function isValidEmail(email) {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}
