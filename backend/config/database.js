const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "..", "siscomFacturas.db");
const db = new Database(dbPath);

const initDatabase = () => {
  // Tabla de usuarios
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      rfc TEXT,
      razon_social TEXT,
      domicilio_fiscal TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    `);

  // Tabla de facturas
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      note_id TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      pdf_path TEXT,
      xml_path TEXT,
      folio_fiscal TEXT,
      total DECIMAL(10,2),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
    `);

  console.log("Tablas de base de datos creadas/verificadas");
};

module.exports = { db, initDatabase };
