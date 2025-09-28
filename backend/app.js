const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const invoiceRoutes = require("./routes/invoices");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors());
app.use(morgan("combined"));
app.use(express.json());

// Rutas
app.use("/auth", authRoutes);
app.use("/invoices", invoiceRoutes);

// Rutas de health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "SISCOM Facturas API funcionando" });
});

// Error handler
app.use(errorHandler);

module.exports = app;
