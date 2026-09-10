import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});
// Error handler
const handleError = (error) => {
  console.error("EcoTrace API request failed", {
    message: error.message,
    url: error.config?.url,
    method: error.config?.method,
    status: error.response?.status,
    response: error.response?.data,
  });
  if (error.response) {
    const detail = error.response.data?.detail;
    throw new Error(detail || `EcoTrace server returned ${error.response.status}`);
  }
  throw new Error("EcoTrace server unavailable");
};

const handleImageError = (error) => {
  console.error("Image analysis error:", error);
  console.error("Status:", error.response?.status);
  console.error("Response:", error.response?.data);
  if (!error.response) throw new Error("Unable to connect to EcoTrace server.");
  if ([400, 422].includes(error.response.status)) throw new Error("Image could not be analyzed. Please try another image.");
  if (error.response.status >= 500) throw new Error("Image analysis failed on the server.");
  throw new Error(error.response.data?.detail || "Image could not be analyzed. Please try another image.");
};

export const apiService = {
  // Health check
  health: async () => {
    try {
      const response = await api.get("/health");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Evaluate waste
  evaluateWaste: async (wasteData) => {
    try {
      const response = await api.post("/evaluate", wasteData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  analyzeImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      const response = await api.post("/analyze-image", formData);
      return response.data;
    } catch (error) {
      handleImageError(error);
    }
  },

  // Get recyclers
  getRecyclers: async () => {
    try {
      const response = await api.get("/recyclers");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Match recyclers for specific waste
  matchRecyclers: async (itemType, estimatedValue) => {
    try {
      const response = await api.post("/match-recyclers", {
        item_type: itemType,
        estimated_value: estimatedValue,
      });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get offers
  getOffers: async (matchedRecyclers, estimatedValue) => {
    try {
      const response = await api.post("/offers", {
        recyclers: matchedRecyclers,
        estimated_value: estimatedValue,
      });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Create new lot
  createLot: async (lotData) => {
    try {
      const response = await api.post("/lots", lotData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get all lots
  getLots: async () => {
    try {
      const response = await api.get("/lots");
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get specific lot
  getLot: async (lotId) => {
    try {
      const response = await api.get(`/lots/${lotId}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Update lot status
  updateLotStatus: async (lotId, status) => {
    try {
      const response = await api.patch(`/lots/${lotId}/status`, {
        status: status,
      });
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Confirm handover
  confirmHandover: async (handoverData) => {
    try {
      const response = await api.post("/handover", handoverData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Confirm payment
  confirmPayment: async (paymentData) => {
    try {
      const response = await api.post("/payment", paymentData);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

export default api;
