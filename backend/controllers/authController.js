const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  validateEmail,
  validatePassword,
  validateRFC,
} = require("../utils/validators");

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email y contraseña son requeridos",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        error: "Email inválido",
      });
    }

    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: "Credenciales inválidas",
      });
    }

    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: "Credenciales inválidas",
      });
    }

    const token = generateToken(user);

    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        rfc: user.rfc,
        razon_social: user.razon_social,
        needsOnboarding: !user.rfc, // Si no tiene RFC, necesita onboarding
      },
    });
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const { email, password, rfc, razon_social, domicilio_fiscal } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        error: "Email y contraseña son requeridos",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        error: "Email inválido",
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    // Si incluye datos fiscales, validarlos
    if (rfc && !validateRFC(rfc)) {
      return res.status(400).json({
        error: "RFC inválido",
      });
    }

    const user = await User.create({
      email,
      password,
      rfc,
      razon_social,
      domicilio_fiscal,
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "Usuario creado exitosamente",
      token,
      user: {
        id: user.id,
        email: user.email,
        rfc: user.rfc,
        razon_social: user.razon_social,
        needsOnboarding: !user.rfc,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateFiscalData = async (req, res, next) => {
  try {
    const { rfc, razon_social, domicilio_fiscal } = req.body;
    const userId = req.user.id;

    // Validaciones
    if (!rfc || !razon_social || !domicilio_fiscal) {
      return res.status(400).json({
        error: "RFC, razón social y domicilio fiscal son requeridos",
      });
    }

    if (!validateRFC(rfc)) {
      return res.status(400).json({
        error: "RFC inválido",
      });
    }

    // Actualizar datos fiscales
    User.updateFiscalData(userId, { rfc, razon_social, domicilio_fiscal });

    // Obtener usuario actualizado
    const updatedUser = User.findById(userId);

    res.json({
      message: "Datos fiscales actualizados correctamente",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        rfc: updatedUser.rfc,
        razon_social: updatedUser.razon_social,
        needsOnboarding: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login, register, updateFiscalData };
