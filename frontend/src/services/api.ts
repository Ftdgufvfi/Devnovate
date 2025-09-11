import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Projects API
export const projectsAPI = {
  // Get all projects
  getAll: () => api.get('/api/projects'),
  
  // Get project by ID
  getById: (id: string) => api.get(`/api/projects/${id}`),
  
  // Create new project
  create: (projectData: any) => api.post('/api/projects', projectData),
  
  // Update project
  update: (id: string, projectData: any) => api.put(`/api/projects/${id}`, projectData),
  
  // Delete project
  delete: (id: string) => api.delete(`/api/projects/${id}`)
};

// AI API
export const aiAPI = {
  // Generate code from components
  generateCode: (components: any[], framework = 'react') => 
    api.post('/api/ai/generate-code', { components, framework }),
  
  // Generate backend code
  generateBackend: (models: any[], endpoints: any[]) =>
    api.post('/api/ai/generate-backend', { models, endpoints }),
  
  // AI chat assistant
  chat: (message: string, context?: any) =>
    api.post('/api/ai/chat', { message, context })
};

// Deployment API
export const deploymentAPI = {
  // Deploy project
  deploy: (projectId: string, platform = 'vercel') =>
    api.post('/api/deployment/deploy', { projectId, platform }),
  
  // Get deployment status
  getStatus: (deploymentId: string) =>
    api.get(`/api/deployment/status/${deploymentId}`)
};

export default api;
