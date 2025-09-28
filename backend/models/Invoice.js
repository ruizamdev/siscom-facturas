const { db } = require("../config/database");

class Invoice {
  static create(invoiceData) {
    const { user_id, note_id, status = "pending", total } = invoiceData;

    const stmt = db.prepare(`
      INSERT INTO invoices (user_id, note_id, status, total)

      VALUES (?, ?, ?, ?)
      `);

    const result = stmt.run(user_id, note_id, status, total);
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const stmt = db.prepare("SELECT * FROM invoices WHERE id = ?");
    return stmt.get(id);
  }

  static findByUserId(userId) {
    const stmt = db.prepare(`
      SELECT * FROM invoices
      WHERE user_id = ?
      ORDER BY created_at DESC
      `);
    return stmt.all(userId);
  }

  static findByNoteId(noteId) {
    const stmt = db.prepare("SELECT * FROM invoices WHERE note_id = ?");
    return stmt.get(noteId);
  }

  static updateStatus(id, status, additionalData = {}) {
    const { pdf_path, xml_path, folio_fiscal } = additionalData;

    const stmt = db.prepare(`
      UPDATE invoices
      SET status = ?, pdf_path = ?, xml_path = ?, folio_fiscal = ?
      WHERE id = ?
      `);

    return stmt.run(status, pdf_path, xml_path, folio_fiscal, id);
  }
}

module.exports = Invoice;
