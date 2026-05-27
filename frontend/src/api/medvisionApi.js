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
   * Send a chest X-Ray file to be analyzed by the ResNet-50 CNN.
   * @param {File} imageFile - The file object of the chest X-Ray.
   * @returns {Promise<object>} { label, confidence, all_probs: { NORMAL, PNEUMONIA }, status }
   */
  analyzeImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await apiClient.post('/api/analyze-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
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
