import { useState } from "react";
import { invoicesAPI } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import Button from "../ui/Button";

const InvoiceTable = ({ invoices, onRefresh }) => {
  const { showError, showSuccess } = useToast();

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

  return (
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
            <InvoiceRow
              key={invoice.id}
              invoice={invoice}
              getStatusBadge={getStatusBadge}
              formatDate={formatDate}
              formatCurrency={formatCurrency}
              onRefresh={onRefresh}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const InvoiceRow = ({
  invoice,
  getStatusBadge,
  formatDate,
  formatCurrency,
  onRefresh,
}) => {
  const { showError, showSuccess } = useToast();

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">{invoice.note_id}</div>
        <div className="text-sm text-gray-500">ID: {invoice.id}</div>
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
  );
};

const DownloadButton = ({ invoiceId, type }) => {
  const [downloading, setDownloading] = useState(false);
  const { showError, showSuccess } = useToast();

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await invoicesAPI.getDownloadUrl(invoiceId, type);
      showSuccess(`Descargando ${type.toUpperCase()}...`);
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

export default InvoiceTable;
