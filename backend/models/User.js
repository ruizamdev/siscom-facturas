const { db } = require("../config/database");
const argon2 = require("argon2");

class User {
  static async create(userData) {
    const { email, password, rfc, razon_social, domicilio_fiscal } = userData;
    // Hash password
    const hashedPassword = await argon2.hash(password);

    const stmt = db.prepare(`
      INSERT INTO users (email, password, rfc, razon_social, domicilio_fiscal)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      email,
      hashedPassword,
      rfc,
      razon_social,
      domicilio_fiscal
    );
    return this.findById(result.lastInsertRowid);
  }

  static findByEmail(email) {
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    return stmt.get(email);
  }

  static findById(id) {
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
    return stmt.get(id);
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await argon2.verify(hashedPassword, plainPassword);
  }

  static updateFiscalData(userId, fiscalData) {
    const { rfc, razon_social, domicilio_fiscal } = fiscalData;
    const stmt = db.prepare(`
      UPDATE users
      SET rfc = ?, razon_social = ?, domicilio_fiscal = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `);
    return stmt.run(rfc, razon_social, domicilio_fiscal, userId);
  }
}

module.exports = User;
