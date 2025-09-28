import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { invoicesAPI } from "../services/api";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

const STEPS = {
  NOTE_INPUT: "note_input",
  VALIDATION: "validation",
  CONFIRMATION: "confirmation",
  PROCESSING: "processing",
  COMPLETED: "completed",
};

const InvoiceGenerator = () => {
  const [currentStep, setCurrentStep] = useState(STEPS.NOTE_INPUT);
  const [noteId, setNoteId] = useState("");
  const [noteData, setNoteData] = useState(null);
  const [fiscalData, setFiscalData] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const handleNoteSubmit = async (e) => {
    e.preventDefault();

    if (!noteId.trim()) {
      showError("Por favor ingresa el ID de la nota");
      return;
    }

    setLoading(true);
    try {
      const response = await invoicesAPI.validateNote(noteId.trim());
      setNoteData(response.noteData);
      setFiscalData(response.fiscalData);
      setCurrentStep(STEPS.VALIDATION);
      showSuccess("Nota encontrada y validada");
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmInvoice = async () => {
    setLoading(true);
    try {
      const response = await invoicesAPI.generate(noteId, { confirmed: true });
      setInvoice(response.invoice);
      setCurrentStep(STEPS.PROCESSING);

      // Simular el proceso de timbrado
      setTimeout(() => {
        setCurrentStep(STEPS.COMPLETED);
        showSuccess("¡Factura generada exitosamente!");
      }, 3000);
    } catch (error) {
      showError(error.message);
      setCurrentStep(STEPS.CONFIRMATION);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(STEPS.NOTE_INPUT);
    setNoteId("");
    setNoteData(null);
    setFiscalData(null);
    setInvoice(null);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const getStepIndicator = () => {
    const steps = [
      { key: STEPS.NOTE_INPUT, label: "Buscar Nota", number: 1 },
      { key: STEPS.VALIDATION, label: "Validar Datos", number: 2 },
      { key: STEPS.CONFIRMATION, label: "Confirmar", number: 3 },
      { key: STEPS.PROCESSING, label: "Procesar", number: 4 },
      { key: STEPS.COMPLETED, label: "Completado", number: 5 },
    ];

    const currentStepIndex = steps.findIndex(
      (step) => step.key === currentStep
    );

    return (
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center">
              <div
                className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                ${
                  index <= currentStepIndex
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }
              `}
              >
                {step.number}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  index <= currentStepIndex ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-4 ${
                    index < currentStepIndex ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Crear Nueva Factura
              </h1>
              <p className="text-gray-600">
                Genera facturas automáticamente desde ContPAQi
              </p>
            </div>
            <Button onClick={handleBackToDashboard} variant="outline" size="sm">
              ← Volver al Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {getStepIndicator()}

        {/* Step 1: Note Input */}
        {currentStep === STEPS.NOTE_INPUT && (
          <Card>
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Buscar Nota de ContPAQi
              </h2>
              <p className="text-gray-600">
                Ingresa el ID de la nota de venta que quieres facturar
              </p>
            </div>

            <form onSubmit={handleNoteSubmit} className="max-w-md mx-auto">
              <Input
                label="ID de Nota"
                value={noteId}
                onChange={(e) => setNoteId(e.target.value.toUpperCase())}
                placeholder="Ej: NOTA001"
                className="mb-6"
                required
              />

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">
                  💡 Notas de ejemplo
                </h3>
                <p className="text-blue-700 text-sm mb-2">
                  Para probar puedes usar:
                </p>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => setNoteId("NOTA001")}
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    NOTA001
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoteId("NOTA002")}
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    NOTA002
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
              >
                {loading ? "Buscando en ContPAQi..." : "Buscar Nota"}
              </Button>
            </form>
          </Card>
        )}

        {/* Step 2: Validation */}
        {currentStep === STEPS.VALIDATION && noteData && fiscalData && (
          <div className="space-y-6">
            <Card>
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">✅</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Nota Encontrada
                </h2>
                <p className="text-gray-600">
                  Revisa que todos los datos sean correctos antes de continuar
                </p>
              </div>

              {/* Datos de la Nota */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    📋 Datos de la Nota
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        ID de Nota:
                      </span>
                      <p className="font-mono text-blue-600">{noteId}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Cliente:
                      </span>
                      <p className="font-medium">{noteData.cliente}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Fecha:
                      </span>
                      <p>{noteData.fecha}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    🏢 Tus Datos Fiscales
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        RFC:
                      </span>
                      <p className="font-mono">{fiscalData.rfc}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Razón Social:
                      </span>
                      <p className="font-medium">{fiscalData.razon_social}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">
                        Domicilio:
                      </span>
                      <p className="text-sm">{fiscalData.domicilio_fiscal}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Productos */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  🛒 Productos/Servicios
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-sm font-medium text-gray-500">
                          Descripción
                        </th>
                        <th className="text-right py-2 text-sm font-medium text-gray-500">
                          Cantidad
                        </th>
                        <th className="text-right py-2 text-sm font-medium text-gray-500">
                          Precio
                        </th>
                        <th className="text-right py-2 text-sm font-medium text-gray-500">
                          Importe
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {noteData.productos.map((producto, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{producto.descripcion}</td>
                          <td className="py-2 text-right">
                            {producto.cantidad}
                          </td>
                          <td className="py-2 text-right">
                            {new Intl.NumberFormat("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            }).format(producto.precio)}
                          </td>
                          <td className="py-2 text-right font-medium">
                            {new Intl.NumberFormat("es-MX", {
                              style: "currency",
                              currency: "MXN",
                            }).format(producto.cantidad * producto.precio)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totales */}
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Subtotal
                    </span>
                    <p className="text-lg font-semibold">
                      {new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      }).format(noteData.subtotal)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      IVA (16%)
                    </span>
                    <p className="text-lg font-semibold">
                      {new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      }).format(noteData.iva)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      Total
                    </span>
                    <p className="text-xl font-bold text-blue-600">
                      {new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      }).format(noteData.total)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <Button
                  onClick={() => setCurrentStep(STEPS.NOTE_INPUT)}
                  variant="outline"
                  className="flex-1"
                >
                  ← Cambiar Nota
                </Button>
                <Button
                  onClick={() => setCurrentStep(STEPS.CONFIRMATION)}
                  variant="primary"
                  className="flex-1"
                >
                  Continuar →
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === STEPS.CONFIRMATION && (
          <Card>
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Confirmar Facturación
              </h2>
              <p className="text-gray-600">
                ¿Estás seguro de que quieres generar la factura?
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-yellow-900 mb-2">
                ⚠️ Importante
              </h3>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>
                  • Una vez generada, la factura no se puede cancelar desde este
                  portal
                </li>
                <li>• Se enviará automáticamente al PAC para timbrado</li>
                <li>• Los archivos PDF y XML se generarán automáticamente</li>
                <li>• El proceso puede tardar unos segundos</li>
              </ul>
            </div>

            <div className="text-center mb-6">
              <p className="text-lg font-medium text-gray-900">
                Factura por:{" "}
                {new Intl.NumberFormat("es-MX", {
                  style: "currency",
                  currency: "MXN",
                }).format(noteData?.total || 0)}
              </p>
              <p className="text-gray-600">Nota: {noteId}</p>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={() => setCurrentStep(STEPS.VALIDATION)}
                variant="outline"
                className="flex-1"
              >
                ← Revisar Datos
              </Button>
              <Button
                onClick={handleConfirmInvoice}
                variant="primary"
                className="flex-1"
                loading={loading}
              >
                {loading ? "Generando..." : "✅ Confirmar y Generar"}
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Processing */}
        {currentStep === STEPS.PROCESSING && (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-6">⚙️</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Procesando Factura...
              </h2>
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
                <p className="text-gray-600 mb-6">
                  Estamos enviando tu factura al PAC para timbrado. Este proceso
                  puede tardar unos segundos.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700 text-sm">
                    💡 No cierres esta ventana mientras se procesa la factura
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 5: Completed */}
        {currentStep === STEPS.COMPLETED && invoice && (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                ¡Factura Generada Exitosamente!
              </h2>
              <p className="text-gray-600 mb-8">
                Tu factura ha sido timbrada y está lista para descargar
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 max-w-md mx-auto">
                <h3 className="font-medium text-green-900 mb-3">
                  📄 Detalles de la Factura
                </h3>
                <div className="space-y-2 text-left">
                  <div className="flex justify-between">
                    <span className="text-green-700">Nota:</span>
                    <span className="font-mono text-green-900">{noteId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">ID Factura:</span>
                    <span className="font-mono text-green-900">
                      {invoice.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Total:</span>
                    <span className="font-semibold text-green-900">
                      {new Intl.NumberFormat("es-MX", {
                        style: "currency",
                        currency: "MXN",
                      }).format(invoice.total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => {
                      // Simular descarga PDF
                      showSuccess("Descargando PDF...");
                    }}
                    variant="primary"
                    size="lg"
                  >
                    📄 Descargar PDF
                  </Button>
                  <Button
                    onClick={() => {
                      // Simular descarga XML
                      showSuccess("Descargando XML...");
                    }}
                    variant="outline"
                    size="lg"
                  >
                    📋 Descargar XML
                  </Button>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button onClick={handleStartOver} variant="secondary">
                    🔄 Crear Otra Factura
                  </Button>
                  <Button onClick={handleBackToDashboard} variant="primary">
                    ← Volver al Dashboard
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default InvoiceGenerator;
