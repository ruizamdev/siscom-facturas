const app = require("./app");
const { initDatabase } = require("./config/database");

const PORT = process.env.PORT || 3000;

// Inicializar base de datos
initDatabase();

app.listen(PORT, () => {
  console.log(`Servidor Corriendo en http://localhost:${PORT}`);
  console.log(`Base de datos SQLite inicializada`);
});
