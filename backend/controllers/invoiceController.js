const Invoice = require("../models/Invoice");
const User = require("../models/User");
const ContpaqiService = require("../services/contpaqiService");

const getInvoices = async (req, res, next) => {
  try {
    const invoices = Invoice.findByUserId(req.user.id);
    res.json({ invoices });
  } catch (error) {
    next(error);
  }
};

const validateNote = async (req, res, next) => {
  try {
    const { noteId } = req.body;

    if (!noteId) {
      return res.status(400).json({
        error: "ID de nota requerido",
      });
    }

    // Validar nota en ContPAQi SQL Server
    const validation = await ContpaqiService.validateNote(noteId);

    if (!validation.valid) {
      // Mapear errores específicos a códigos HTTP
      const statusCode = {
        'NOT_FOUND': 404,
        'ALREADY_INVOICED': 409,
        'INVALID_TOTAL': 400,
        'DATABASE_ERROR': 503,
      }[validation.error] || 400;

      return res.status(statusCode).json({
        error: validation.message,
        errorCode: validation.error,
        details: validation.details,
      });
    }

    // Verificar si ya fue facturada localmente (doble verificación)
    const existingInvoice = Invoice.findByNoteId(noteId);
    if (existingInvoice) {
      return res.status(409).json({
        error: "Esta nota ya ha sido facturada en el sistema local",
        invoice: existingInvoice,
      });
    }

    // Obtener datos fiscales del usuario
    const user = User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    if (!user.rfc) {
      return res.status(400).json({
        error: "Debe completar sus datos fiscales antes de facturar",
      });
    }

    // Retornar datos de la nota validada
    res.json({
      message: validation.message,
      noteData: validation.note,
      fiscalData: {
        rfc: user.rfc,
        razon_social: user.razon_social,
        domicilio_fiscal: user.domicilio_fiscal,
      },
    });
  } catch (error) {
    next(error);
  }
};

const generateInvoice = async (req, res, next) => {
  try {
    const { noteId, confirmData } = req.body;

    if (!noteId) {
      return res.status(400).json({
        error: "ID de nota requerido",
      });
    }

    // Validar nota nuevamente en ContPAQi
    const validation = await ContpaqiService.validateNote(noteId);

    if (!validation.valid) {
      const statusCode = {
        'NOT_FOUND': 404,
        'ALREADY_INVOICED': 409,
        'INVALID_TOTAL': 400,
        'DATABASE_ERROR': 503,
      }[validation.error] || 400;

      return res.status(statusCode).json({
        error: validation.message,
        errorCode: validation.error,
      });
    }

    // Verificar localmente
    const existingInvoice = Invoice.findByNoteId(noteId);
    if (existingInvoice) {
      return res.status(409).json({
        error: "Esta nota ya ha sido facturada",
      });
    }

    // Crear registro en base de datos con datos de ContPAQi
    const invoice = Invoice.create({
      user_id: req.user.id,
      note_id: noteId,
      status: "processing",
      total: validation.note.total,
    });

    // Simulación de timbrado con Facturama
    // TODO: Reemplazar con integración real de Facturama API
    setTimeout(() => {
      // Simular resultado exitoso
      const folioFiscal = `${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const pdfPath = `/downloads/facturas/${invoice.id}/factura-${folioFiscal}.pdf`;
      const xmlPath = `/downloads/facturas/${invoice.id}/factura-${folioFiscal}.xml`;

      Invoice.updateStatus(invoice.id, "completed", {
        pdf_path: pdfPath,
        xml_path: xmlPath,
        folio_fiscal: folioFiscal,
      });

      console.log(`✅ Factura ${invoice.id} timbrada exitosamente`);
    }, 3000); // Simular 3 segundos de procesamiento

    res.json({
      message: "Factura en proceso de timbrado",
      invoice: {
        id: invoice.id,
        note_id: noteId,
        status: "processing",
        total: validation.note.total,
      },
    });
  } catch (error) {
    next(error);
  }
};

const downloadInvoice = async (req, res, next) => {
  try {
    const { invoiceId } = req.params;
    const { type } = req.query; // 'pdf' o 'xml'

    const invoice = Invoice.findById(invoiceId);
    if (!invoice || invoice.user_id !== req.user.id) {
      return res.status(404).json({
        error: "Factura no encontrada",
      });
    }

    if (invoice.status !== "completed") {
      return res.status(400).json({
        error: "La factura aún no está lista para descarga",
      });
    }

    const filePath = type === "xml" ? invoice.xml_path : invoice.pdf_path;

    // Aquí normalmente servirías el archivo real
    // Por ahora solo retornamos la información
    res.json({
      message: "Archivo listo para descarga",
      download_url: `http://localhost:3000${filePath}`,
      folio_fiscal: invoice.folio_fiscal,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvoices,
  validateNote,
  generateInvoice,
  downloadInvoice,
};
