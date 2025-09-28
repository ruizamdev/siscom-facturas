const NotePreview = ({ noteData, fiscalData, noteId }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Datos de la Nota y Fiscales */}
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
              <span className="text-sm font-medium text-gray-500">Fecha:</span>
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
              <span className="text-sm font-medium text-gray-500">RFC:</span>
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
      <div>
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
                  <td className="py-2 text-right">{producto.cantidad}</td>
                  <td className="py-2 text-right">
                    {formatCurrency(producto.precio)}
                  </td>
                  <td className="py-2 text-right font-medium">
                    {formatCurrency(producto.cantidad * producto.precio)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totales */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <span className="text-sm font-medium text-gray-500">Subtotal</span>
            <p className="text-lg font-semibold">
              {formatCurrency(noteData.subtotal)}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">IVA (16%)</span>
            <p className="text-lg font-semibold">
              {formatCurrency(noteData.iva)}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-500">Total</span>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(noteData.total)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotePreview;
