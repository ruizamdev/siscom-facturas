const Invoice = require("../models/Invoice");
const User = require("../models/User");

// Simulador de datos de ContPAQi (reemplazar después con consulta real)
const mockContPAQiData = {
  NOTA001: {
    cliente: "Juan Pérez García",
    productos: [{ descripcion: "Consultoría IT", cantidad: 1, precio: 5000.0 }],
    subtotal: 5000.0,
    iva: 800.0,
    total: 5800.0,
    fecha: "2025-09-28",
  },
  NOTA002: {
    cliente: "María González López",
    productos: [{ descripcion: "Desarrollo Web", cantidad: 1, precio: 8000.0 }],
    subtotal: 8000.0,
    iva: 1280.0,
    total: 9280.0,
    fecha: "2025-09-28",
  },
};

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

    // Verificar si la nota existe en ContPAQi (simulado)
    const noteData = mockContPAQiData[noteId];
    if (!noteData) {
      return res.status(404).json({
        error: "Nota no encontrada en ContPAQi",
      });
    }

    // Verificar si ya fue facturada
    const existingInvoice = Invoice.findByNoteId(noteId);
    if (existingInvoice) {
      return res.status(409).json({
        error: "Esta nota ya ha sido facturada",
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

    res.json({
      message: "Nota válida para facturación",
      noteData,
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

    // Verificar nota nuevamente
    const noteData = mockContPAQiData[noteId];
    if (!noteData) {
      return res.status(404).json({
        error: "Nota no encontrada",
      });
    }

    const existingInvoice = Invoice.findByNoteId(noteId);
    if (existingInvoice) {
      return res.status(409).json({
        error: "Esta nota ya ha sido facturada",
      });
    }

    // Crear registro en base de datos
    const invoice = Invoice.create({
      user_id: req.user.id,
      note_id: noteId,
      status: "processing",
      total: noteData.total,
    });

    // Simulación de timbrado con Facturama
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
        total: noteData.total,
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
