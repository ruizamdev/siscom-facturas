const API_BASE_URL = "http://localhost:3000";

// Configuración de fetch con manejo de errores
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Agregar token si existe
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Error en la petición");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// API Methods
export const authAPI = {
  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  verify: () => apiRequest("/auth/verify"),

  updateFiscalData: (fiscalData) =>
    apiRequest("/auth/fiscal-data", {
      method: "PUT",
      body: JSON.stringify(fiscalData),
    }),
};

export const invoicesAPI = {
  getAll: () => apiRequest("/invoices"),

  validateNote: (noteId) =>
    apiRequest("/invoices/validate-note", {
      method: "POST",
      body: JSON.stringify({ noteId }),
    }),

  generate: (noteId, confirmData) =>
    apiRequest("/invoices/generate", {
      method: "POST",
      body: JSON.stringify({ noteId, confirmData }),
    }),

  getDownloadUrl: (invoiceId, type = "pdf") =>
    apiRequest(`/invoices/download/${invoiceId}?type=${type}`),
};
