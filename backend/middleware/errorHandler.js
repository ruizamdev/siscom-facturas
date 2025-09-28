const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.stack);

  // Manejo de errores de SQLite con better-sqlite3
  if (err.message && err.message.includes("UNIQUE constraint failed: users.email")) {
    return res.status(400).json({
      error: "Ya existe un usuario con ese email",
    });
  }

  if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return res.status(400).json({
      error: "Ya existe un usuario con ese email",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Datos inválidos",
      details: err.message,
    });
  }

  res.status(500).json({
    error: "Error interno del servidor",
  });
};

module.exports = { errorHandler };
