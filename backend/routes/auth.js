const express = require("express");
const { login, register, updateFiscalData } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.post("/register", register);

// Ruta para actualizar datos fiscales
router.put("/fiscal-data", authenticateToken, updateFiscalData);

// Ruta para verificar token
router.get("/verify", authenticateToken, (req, res) => {
  res.json({
    message: "Token válido",
    user: req.user,
  });
});

module.exports = router;
