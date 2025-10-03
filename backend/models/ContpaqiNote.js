const { executeQuery, sql } = require('../config/contpaqiDatabase');

/**
 * Modelo para interactuar con las notas de ContPAQi
 */
class ContpaqiNote {
  /**
   * Busca una nota por su folio
   * @param {string} folio - Folio de la nota
   * @returns {Promise<Object|null>} Datos de la nota o null si no existe
   */
  static async findByFolio(folio) {
    const query = `
      SELECT
        DocumentID,
        Folio,
        FolioPrefix,
        DocumentTypeID,
        BusinessEntityID,
        DateDocument,
        Total,
        SubTotal,
        TotalTax,
        TotalDiscount,
        CurrencyID,
        DeletedOn,
        CancelledOn,
        StatusPaidID,
        Comments,
        Title
      FROM dbo.docDocument
      WHERE Folio = @folio
        AND DeletedOn IS NULL
        AND CancelledOn IS NULL
    `;

    try {
      const result = await executeQuery(query, { folio });

      if (result.recordset.length === 0) {
        return null;
      }

      return result.recordset[0];
    } catch (error) {
      console.error('Error buscando nota por folio:', error);
      throw new Error('Error al consultar la nota en ContPAQi');
    }
  }

  /**
   * Busca una nota por su DocumentID
   * @param {number} documentId - ID del documento
   * @returns {Promise<Object|null>} Datos de la nota o null si no existe
   */
  static async findById(documentId) {
    const query = `
      SELECT
        DocumentID,
        Folio,
        FolioPrefix,
        DocumentTypeID,
        BusinessEntityID,
        DateDocument,
        Total,
        SubTotal,
        TotalTax,
        TotalDiscount,
        CurrencyID,
        DeletedOn,
        CancelledOn,
        StatusPaidID,
        Comments,
        Title
      FROM dbo.docDocument
      WHERE DocumentID = @documentId
    `;

    try {
      const result = await executeQuery(query, { documentId: sql.BigInt(documentId) });

      if (result.recordset.length === 0) {
        return null;
      }

      return result.recordset[0];
    } catch (error) {
      console.error('Error buscando nota por ID:', error);
      throw new Error('Error al consultar la nota en ContPAQi');
    }
  }

  /**
   * Verifica si una nota ya tiene un CFDI (factura) asociado
   * @param {number} documentId - ID del documento (nota)
   * @returns {Promise<Object|null>} Datos del CFDI si existe, null si no está facturada
   */
  static async checkIfInvoiced(documentId) {
    // Primero buscar directamente en docDocumentCFDiSAT
    const queryDirectCFDI = `
      SELECT
        DocSATID,
        DocumentID,
        UUID,
        TipoComprobante,
        Status,
        FechaEmision,
        Total,
        Serie,
        Folio AS FolioCFDI
      FROM dbo.docDocumentCFDiSAT
      WHERE DocumentID = @documentId
        AND DeletedOn IS NULL
        AND Status = 'Vigente'
    `;

    // También buscar si es documento origen en relaciones CFDI
    const queryRelatedCFDI = `
      SELECT
        cfdi.DocSATID,
        cfdi.DocumentID,
        cfdi.UUID,
        cfdi.TipoComprobante,
        cfdi.Status,
        cfdi.FechaEmision,
        cfdi.Total,
        cfdi.Serie,
        cfdi.Folio AS FolioCFDI,
        rel.CFDTipoRelacion
      FROM dbo.docDocumentCFDIRelacionados rel
      INNER JOIN dbo.docDocumentCFDiSAT cfdi ON cfdi.DocumentID = rel.DocumentID
      WHERE rel.SourceDocumentID = @documentId
        AND cfdi.DeletedOn IS NULL
        AND cfdi.Status = 'Vigente'
    `;

    try {
      // Buscar CFDI directo
      const directResult = await executeQuery(queryDirectCFDI, { documentId: sql.BigInt(documentId) });

      if (directResult.recordset.length > 0) {
        return {
          isInvoiced: true,
          cfdi: directResult.recordset[0],
          relationType: 'direct'
        };
      }

      // Buscar CFDI relacionado
      const relatedResult = await executeQuery(queryRelatedCFDI, { documentId: sql.BigInt(documentId) });

      if (relatedResult.recordset.length > 0) {
        return {
          isInvoiced: true,
          cfdi: relatedResult.recordset[0],
          relationType: 'related'
        };
      }

      return null;
    } catch (error) {
      console.error('Error verificando si la nota está facturada:', error);
      throw new Error('Error al verificar el estado de facturación en ContPAQi');
    }
  }

  /**
   * Obtiene los items (conceptos) de una nota
   * @param {number} documentId - ID del documento
   * @returns {Promise<Array>} Array de items de la nota
   */
  static async getItems(documentId) {
    const query = `
      SELECT
        DocumentItemID,
        DocumentID,
        ProductID,
        Quantity,
        UnitPrice,
        Discount,
        Total,
        Comments
      FROM dbo.docDocumentItem
      WHERE DocumentID = @documentId
      ORDER BY DocumentItemID
    `;

    try {
      const result = await executeQuery(query, { documentId: sql.BigInt(documentId) });
      return result.recordset;
    } catch (error) {
      console.error('Error obteniendo items de la nota:', error);
      throw new Error('Error al consultar los items de la nota en ContPAQi');
    }
  }
}

module.exports = ContpaqiNote;
