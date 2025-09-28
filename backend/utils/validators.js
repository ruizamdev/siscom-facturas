const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateRFC = (rfc) => {
  // RFC persona física: 4 letras + 6 números + 3 caracteristicas
  // RFC persona moral: 3 letras + 6 números + 3 caracteres
  const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-V1-9][A-Z1-9][0-9A]$/;
  return rfcRegex.test(rfc.toUpperCase());
};

const validatePassword = (password) => {
  // Mínimo 6 caracteres
  return password && password.length >= 6;
};

module.exports = {
  validateEmail,
  validateRFC,
  validatePassword,
};
