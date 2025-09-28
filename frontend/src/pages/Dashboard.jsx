import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { invoicesAPI } from "../services/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const Dashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { user, logout } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const loadInvoices = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await invoicesAPI.getAll();
      setInvoices(response.invoices);
    } catch (error) {
      showError("Error al cargar facturas: " + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handleCreateInvoice = () => {
    navigate("/crear-factura");
  };

  const handleLogout = () => {
    logout();
    showSuccess("Sesión cerrada");
    navigate("/login");
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "Pendiente",
      },
      processing: {
        bg: "bg-blue-100",
        text: "text-blue-800",
        label: "Procesando",
      },
      completed: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "Completada",
      },
      failed: { bg: "bg-red-100", text: "text-red-800", label: "Error" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                SISCOM Facturas
              </h1>
              <p className="text-gray-600">Bienvenido, {user?.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => loadInvoices(false)}
                variant="outline"
                size="sm"
                loading={refreshing}
              >
                {refreshing ? "Actualizando..." : "🔄 Actualizar"}
              </Button>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Total Facturas
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {invoices.length}
            </p>
          </Card>

          <Card className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Completadas
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {invoices.filter((inv) => inv.status === "completed").length}
            </p>
          </Card>

          <Card className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Total Facturado
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {formatCurrency(
                invoices
                  .filter((inv) => inv.status === "completed")
                  .reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0)
              )}
            </p>
          </Card>
        </div>

        {/* Action Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Mis Facturas</h2>
          <Button
            onClick={handleCreateInvoice}
            variant="primary"
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            🧾 Crear Nueva Factura
          </Button>
        </div>

        {/* Facturas Table */}
        <Card className="overflow-hidden">
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tienes facturas aún
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza creando tu primera factura ahora mismo
              </p>
              <Button onClick={handleCreateInvoice} variant="primary" size="lg">
                Crear Mi Primera Factura
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Folio Fiscal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {invoice.note_id}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {invoice.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.total ? formatCurrency(invoice.total) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.folio_fiscal ? (
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {invoice.folio_fiscal}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {invoice.status === "completed" ? (
                          <div className="flex space-x-2">
                            <DownloadButton invoiceId={invoice.id} type="pdf" />
                            <DownloadButton invoiceId={invoice.id} type="xml" />
                          </div>
                        ) : invoice.status === "processing" ? (
                          <div className="flex items-center text-blue-600">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Procesando...
                          </div>
                        ) : invoice.status === "failed" ? (
                          <Button
                            onClick={() => {
                              // Aquí podrías implementar reintento
                              showError("Función de reintento próximamente");
                            }}
                            variant="danger"
                            size="sm"
                          >
                            Reintentar
                          </Button>
                        ) : (
                          <span className="text-gray-400">Pendiente</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            💡 Las facturas se procesan automáticamente con Facturama. Los
            archivos PDF y XML estarán listos en unos segundos.
          </p>
        </div>
      </main>
    </div>
  );
};

// Componente para botones de descarga
const DownloadButton = ({ invoiceId, type }) => {
  const [downloading, setDownloading] = useState(false);
  const { showError, showSuccess } = useToast();

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await invoicesAPI.getDownloadUrl(invoiceId, type);

      // Simular descarga (en producción abrirías el URL real)
      showSuccess(`Descargando ${type.toUpperCase()}...`);

      // En producción harías algo como:
      // window.open(response.download_url, '_blank')
    } catch (error) {
      showError(`Error al descargar ${type.toUpperCase()}: ` + error.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      size="sm"
      loading={downloading}
      className="text-xs"
    >
      {type.toUpperCase()}
    </Button>
  );
};

export default Dashboard;
