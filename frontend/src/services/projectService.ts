import axios from 'axios';
import { Project, Page } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance for project API
const projectAPI = axios.create({
  baseURL: `${API_URL}/projects`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
projectAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
projectAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const projectService = {
  // Get all user projects
  async getProjects(): Promise<Project[]> {
    try {
      const response = await projectAPI.get('/');
      return response.data.projects;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch projects'
      );
    }
  },

  // Get single project by ID
  async getProject(id: string): Promise<Project> {
    try {
      const response = await projectAPI.get(`/${id}`);
      return response.data.project;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch project'
      );
    }
  },

  // Create new project
  async createProject(projectData: Partial<Project>): Promise<Project> {
    try {
      const response = await projectAPI.post('/', {
        name: projectData.name,
        description: projectData.description || '',
        settings: projectData.settings || {}
      });
      return response.data.project;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to create project'
      );
    }
  },

  // Update project
  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    try {
      const response = await projectAPI.put(`/${id}`, updates);
      return response.data.project;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to update project'
      );
    }
  },

  // Delete project
  async deleteProject(id: string): Promise<void> {
    try {
      await projectAPI.delete(`/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to delete project'
      );
    }
  },

  // Publish project
  async publishProject(id: string): Promise<{ publishedUrl: string }> {
    try {
      const response = await projectAPI.post(`/${id}/publish`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to publish project'
      );
    }
  },

  // Create page in project
  async createPage(projectId: string, pageData: Partial<Page>): Promise<Page> {
    try {
      const response = await projectAPI.post(`/${projectId}/pages`, {
        name: pageData.name,
        slug: pageData.slug || pageData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        endpoint: pageData.endpoint || ('/' + (pageData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || '')),
        description: pageData.description || '',
        order: pageData.order || 0
      });
      return response.data.page;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to create page'
      );
    }
  },

  // Update page
  async updatePage(projectId: string, pageId: string, updates: Partial<Page>): Promise<Page> {
    try {
      const response = await projectAPI.put(`/${projectId}/pages/${pageId}`, updates);
      return response.data.page;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to update page'
      );
    }
  },

  // Delete page
  async deletePage(projectId: string, pageId: string): Promise<void> {
    try {
      await projectAPI.delete(`/${projectId}/pages/${pageId}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to delete page'
      );
    }
  },

  // Get pages for a project
  async getPages(projectId: string): Promise<Page[]> {
    try {
      const response = await projectAPI.get(`/${projectId}/pages`);
      return response.data.pages;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch pages'
      );
    }
  },

  // Get single page by ID
  async getPage(projectId: string, pageId: string): Promise<Page> {
    try {
      const response = await projectAPI.get(`/${projectId}/pages/${pageId}`);
      return response.data.page;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch page'
      );
    }
  },

  // Get canvas state for a page
  async getCanvasState(projectId: string, pageId: string): Promise<any> {
    try {
      const response = await projectAPI.get(`/${projectId}/pages/${pageId}/canvas`);
      return response.data.canvasState;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to fetch canvas state'
      );
    }
  },

  // Save React component code
  async saveReactCode(projectId: string, pageId: string, reactCode: string): Promise<{ success: boolean; message: string; lastModified: Date }> {
    try {
      const response = await projectAPI.put(`/${projectId}/pages/${pageId}/react-code`, { reactCode });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to save React code'
      );
    }
  },

  // Get React component code
  async getReactCode(projectId: string, pageId: string): Promise<{ success: boolean; reactCode: string; lastModified: Date; message: string }> {
    try {
      const response = await projectAPI.get(`/${projectId}/pages/${pageId}/react-code`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to get React code'
      );
    }
  },

  // Download project as zip/tar file
  async downloadProject(projectId: string): Promise<void> {
    try {
      const response = await projectAPI.get(`/${projectId}/download`, {
        responseType: 'blob', // Important for file downloads
        headers: {
          'Accept': 'application/gzip'
        }
      });

      // Create blob from response
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] || 'application/gzip' 
      });

      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'project.tar.gz';
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to download project'
      );
    }
  }
};
