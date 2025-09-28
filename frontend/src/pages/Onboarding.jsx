import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

const Onboarding = () => {
  const [formData, setFormData] = useState({
    rfc: "",
    razon_social: "",
    domicilio_fiscal: "",
  });
  const [loading, setLoading] = useState(false);

  const { user, updateFiscalData } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Actualizar datos fiscales usando la API real
      await updateFiscalData(formData);

      showSuccess("Datos fiscales guardados correctamente");
      navigate("/dashboard");
    } catch (error) {
      showError(error.message || "Error al guardar los datos fiscales");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Bienvenido a SISCOM Facturas!
          </h1>
          <p className="mt-2 text-gray-600">
            Para comenzar a facturar, necesitamos tus datos fiscales
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="RFC"
              name="rfc"
              value={formData.rfc}
              onChange={handleChange}
              required
              placeholder="XAXX010101000"
              className="uppercase"
            />

            <Input
              label="Razón Social"
              name="razon_social"
              value={formData.razon_social}
              onChange={handleChange}
              required
              placeholder="Nombre de tu empresa o persona física"
            />

            <Input
              label="Domicilio Fiscal"
              name="domicilio_fiscal"
              value={formData.domicilio_fiscal}
              onChange={handleChange}
              required
              placeholder="Calle, número, colonia, CP, ciudad, estado"
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">
                💡 Tip importante
              </h3>
              <p className="text-blue-700 text-sm">
                Estos datos aparecerán en todas las facturas que generes.
                Asegúrate de que sean correctos antes de continuar.
              </p>
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                className="flex-1"
              >
                Guardar y Continuar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
