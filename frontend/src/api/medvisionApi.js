import axios from 'axios';

// Central API instance pointing to the FastAPI backend.
// By default, FastAPI's uvicorn server runs on port 8000.
const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000, // clinical models can take time to run prediction
});

/**
 * CLINICAL NOTE ON CORS:
 * The FastAPI backend (api/main.py) must allow requests from the React development server.
 * In the project's backend, this is already handled by:
 * 
 * app.add_middleware(
 *     CORSMiddleware,
 *     allow_origins=["*"],  # Allows all origins including http://localhost:3000
 *     allow_methods=["*"],
 *     allow_headers=["*"],
 * )
 * 
 * If you deploy to production, restrict 'allow_origins' to specific front-end domains.
 */

export const medvisionApi = {
  /**
   * Send a chest X-Ray file to be analyzed by the two-stage pipeline.
   * Stage 1: Gatekeeper (MobileNetV2) validates the image is a chest X-ray.
   * Stage 2: Diagnostic (ResNet-50) classifies NORMAL vs PNEUMONIA.
   * 
   * @param {File} imageFile - The file object of the chest X-Ray.
   * @returns {Promise<object>} 
   *   Success: { label, confidence, all_probs, status: "success" }
   *   Rejection: { status: "rejected", rejection_reason, message }
   */
  analyzeImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await apiClient.post('/api/analyze-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (err) {
      console.error("medvisionApi: analyzeImage request failed:", err);
      if (err.response) {
        console.error("medvisionApi: Error status:", err.response.status);
        console.error("medvisionApi: Raw error data:", err.response.data);
        
        let data = err.response.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch (e) {
            console.error("medvisionApi: Failed to parse error response data as JSON:", e);
          }
        }
        
        if (err.response.status === 422 && data?.status === 'rejected') {
          console.warn("medvisionApi: Image was rejected by gatekeeper:", data);
          return data;   // Return rejection as a structured result object
        }
      }
      throw err;   // Re-throw all other errors (500, network, etc.)
    }
  },

  /**
   * Submit patient demographics, vitals, and comorbidities to evaluate pneumonia severity risk.
   * @param {object} patientData - The PatientData model fields.
   * @returns {Promise<object>} { severity, severe_probability, mild_probability, curb65_score, comorbidity_count, model_used, status }
   */
  predictRisk: async (patientData) => {
    const response = await apiClient.post('/api/predict-risk', patientData);
    return response.data;
  },

  /**
   * Query the MedBot RAG medical assistant using WHO, NIH, and CDC knowledge base guidelines.
   * @param {string} question - The user's query.
   * @returns {Promise<object>} { answer, sources: [], question, status }
   */
  ragChat: async (question) => {
    // Note: The FastAPI backend expects the key to be "question" (ChatRequest Pydantic model)
    const response = await apiClient.post('/api/rag-chat', { question });
    return response.data;
  },

  /**
   * Health check utility to verify backend state.
   */
  checkHealth: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default medvisionApi;
