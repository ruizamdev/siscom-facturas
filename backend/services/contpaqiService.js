const ContpaqiNote = require('../models/ContpaqiNote');

/**
 * Servicio para validación de notas en ContPAQi
 */
class ContpaqiService {
  /**
   * Valida una nota de ContPAQi antes de facturar
   * @param {string} noteId - Folio de la nota a validar
   * @returns {Promise<Object>} Resultado de la validación
   */
  static async validateNote(noteId) {
    try {
      // 1. Buscar la nota por folio
      const note = await ContpaqiNote.findByFolio(noteId);

      // 2. Verificar que existe
      if (!note) {
        return {
          valid: false,
          error: 'NOT_FOUND',
          message: `La nota con folio ${noteId} no existe en ContPAQi o está cancelada/eliminada`,
        };
      }

      // 3. Verificar si ya está facturada
      const invoiceCheck = await ContpaqiNote.checkIfInvoiced(note.DocumentID);

      if (invoiceCheck && invoiceCheck.isInvoiced) {
        const cfdi = invoiceCheck.cfdi;
        return {
          valid: false,
          error: 'ALREADY_INVOICED',
          message: `La nota ${noteId} ya fue facturada`,
          details: {
            uuid: cfdi.UUID,
            folioCFDI: cfdi.FolioCFDI,
            serie: cfdi.Serie,
            fechaEmision: cfdi.FechaEmision,
            total: cfdi.Total,
            status: cfdi.Status,
            relationType: invoiceCheck.relationType
          }
        };
      }

      // 4. Validar que tenga total válido
      if (!note.Total || note.Total <= 0) {
        return {
          valid: false,
          error: 'INVALID_TOTAL',
          message: `La nota ${noteId} tiene un total inválido (${note.Total})`,
        };
      }

      // 5. Nota válida - retornar datos
      return {
        valid: true,
        message: `La nota ${noteId} es válida y puede ser facturada`,
        note: {
          documentId: note.DocumentID,
          folio: note.Folio,
          folioPrefix: note.FolioPrefix,
          businessEntityId: note.BusinessEntityID,
          dateDocument: note.DateDocument,
          total: note.Total,
          subTotal: note.SubTotal,
          totalTax: note.TotalTax,
          totalDiscount: note.TotalDiscount,
          currencyId: note.CurrencyID,
          title: note.Title,
          comments: note.Comments,
        }
      };

    } catch (error) {
      console.error('Error en validateNote:', error);
      return {
        valid: false,
        error: 'DATABASE_ERROR',
        message: 'Error al validar la nota en ContPAQi. Verifique la conexión a la base de datos.',
        details: error.message
      };
    }
  }

  /**
   * Obtiene los detalles completos de una nota incluyendo sus items
   * @param {string} noteId - Folio de la nota
   * @returns {Promise<Object>} Detalles completos de la nota
   */
  static async getNoteDetails(noteId) {
    try {
      // Buscar la nota
      const note = await ContpaqiNote.findByFolio(noteId);

      if (!note) {
        return {
          found: false,
          message: `La nota con folio ${noteId} no existe`,
        };
      }

      // Obtener los items
      const items = await ContpaqiNote.getItems(note.DocumentID);

      return {
        found: true,
        note: {
          documentId: note.DocumentID,
          folio: note.Folio,
          folioPrefix: note.FolioPrefix,
          businessEntityId: note.BusinessEntityID,
          dateDocument: note.DateDocument,
          total: note.Total,
          subTotal: note.SubTotal,
          totalTax: note.TotalTax,
          totalDiscount: note.TotalDiscount,
          currencyId: note.CurrencyID,
          title: note.Title,
          comments: note.Comments,
        },
        items: items.map(item => ({
          itemId: item.DocumentItemID,
          productId: item.ProductID,
          quantity: item.Quantity,
          unitPrice: item.UnitPrice,
          discount: item.Discount,
          total: item.Total,
          comments: item.Comments,
        }))
      };

    } catch (error) {
      console.error('Error en getNoteDetails:', error);
      throw new Error('Error al obtener los detalles de la nota');
    }
  }

  /**
   * Verifica el estado de la conexión a ContPAQi
   * @returns {Promise<Object>} Estado de la conexión
   */
  static async checkConnection() {
    try {
      const { getContpaqiPool } = require('../config/contpaqiDatabase');
      const pool = await getContpaqiPool();

      // Hacer un query simple para verificar conexión
      const result = await pool.request().query('SELECT @@VERSION as version');

      return {
        connected: true,
        message: 'Conexión a ContPAQi SQL Server exitosa',
        version: result.recordset[0].version
      };
    } catch (error) {
      console.error('Error verificando conexión a ContPAQi:', error);
      return {
        connected: false,
        message: 'Error al conectar con ContPAQi SQL Server',
        error: error.message
      };
    }
  }
}

module.exports = ContpaqiService;
