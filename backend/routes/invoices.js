const express = require("express");
const {
  getInvoices,
  validateNote,
  generateInvoice,
  downloadInvoice,
} = require("../controllers/invoiceController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.get("/", getInvoices);
router.post("/validate-note", validateNote);
router.post("/generate", generateInvoice);
router.get("/download/:invoiceId", downloadInvoice);

module.exports = router;
