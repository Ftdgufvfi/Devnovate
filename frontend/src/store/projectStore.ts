import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Page } from '../types';
import { projectService } from '../services/projectService';

interface ProjectState {
  // Projects
  projects: Project[];
  currentProject: Project | null;
  currentPage: Page | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<Project | null>;
  createProject: (projectData: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  
  // Pages
  createPage: (projectId: string, pageData: Partial<Page>) => Promise<Page>;
  getPage: (projectId: string, pageId: string) => Promise<Page>;
  updatePage: (projectId: string, pageId: string, updates: Partial<Page>) => Promise<void>;
  deletePage: (projectId: string, pageId: string) => Promise<void>;
  setCurrentPage: (page: Page | null) => void;
  
  // Error handling
  clearError: () => void;

  // Canvas state
  getCanvasState: (projectId: string, pageId: string) => Promise<any>;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      currentPage: null,
      isLoading: false,
      error: null,

      fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const projects = await projectService.getProjects();
          set({ projects, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch projects', 
            isLoading: false 
          });
        }
      },

      fetchProject: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const project = await projectService.getProject(id);
          // Update the project in the projects array if it exists
          set(state => ({
            projects: state.projects.some(p => p.id === id) 
              ? state.projects.map(p => p.id === id ? project : p)
              : [...state.projects, project],
            currentProject: project,
            isLoading: false
          }));
          return project;
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch project', 
            isLoading: false 
          });
          return null;
        }
      },

      createProject: async (projectData) => {
        set({ isLoading: true, error: null });
        try {
          const newProject = await projectService.createProject(projectData);
          set(state => ({
            projects: [...state.projects, newProject],
            currentProject: newProject,
            isLoading: false
          }));
          return newProject;
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to create project', 
            isLoading: false 
          });
          throw error;
        }
      },

      updateProject: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedProject = await projectService.updateProject(id, updates);
          set(state => ({
            projects: state.projects.map(p => p.id === id ? updatedProject : p),
            currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
            isLoading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to update project', 
            isLoading: false 
          });
          throw error;
        }
      },

      deleteProject: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await projectService.deleteProject(id);
          set(state => ({
            projects: state.projects.filter(p => p.id !== id),
            currentProject: state.currentProject?.id === id ? null : state.currentProject,
            currentPage: state.currentProject?.id === id ? null : state.currentPage,
            isLoading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to delete project', 
            isLoading: false 
          });
          throw error;
        }
      },

      setCurrentProject: (project) => {
        set({ 
          currentProject: project,
          currentPage: project ? project.pages[0] || null : null
        });
      },

      createPage: async (projectId, pageData) => {
        set({ isLoading: true, error: null });
        try {
          const newPage = await projectService.createPage(projectId, pageData);
          set(state => ({
            projects: state.projects.map(p => 
              p.id === projectId 
                ? { ...p, pages: [...p.pages, newPage] }
                : p
            ),
            currentProject: state.currentProject?.id === projectId
              ? { ...state.currentProject, pages: [...state.currentProject.pages, newPage] }
              : state.currentProject,
            currentPage: newPage,
            isLoading: false
          }));
          return newPage;
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to create page', 
            isLoading: false 
          });
          throw error;
        }
      },

      getPage: async (projectId, pageId) => {
        try {
          const page = await projectService.getPage(projectId, pageId);
          return page;
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch page'
          });
          throw error;
        }
      },

      updatePage: async (projectId, pageId, updates) => {
        set({ isLoading: true, error: null });
        try {
          const updatedPage = await projectService.updatePage(projectId, pageId, updates);
          set(state => ({
            projects: state.projects.map(p => 
              p.id === projectId 
                ? { ...p, pages: p.pages.map(page => page.id === pageId ? updatedPage : page) }
                : p
            ),
            currentProject: state.currentProject?.id === projectId
              ? { 
                  ...state.currentProject, 
                  pages: state.currentProject.pages.map(page => page.id === pageId ? updatedPage : page)
                }
              : state.currentProject,
            currentPage: state.currentPage?.id === pageId ? updatedPage : state.currentPage,
            isLoading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to update page', 
            isLoading: false 
          });
          throw error;
        }
      },

      deletePage: async (projectId, pageId) => {
        set({ isLoading: true, error: null });
        try {
          await projectService.deletePage(projectId, pageId);
          set(state => ({
            projects: state.projects.map(p => 
              p.id === projectId 
                ? { ...p, pages: p.pages.filter(page => page.id !== pageId) }
                : p
            ),
            currentProject: state.currentProject?.id === projectId
              ? { 
                  ...state.currentProject, 
                  pages: state.currentProject.pages.filter(page => page.id !== pageId)
                }
              : state.currentProject,
            currentPage: state.currentPage?.id === pageId ? null : state.currentPage,
            isLoading: false
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to delete page', 
            isLoading: false 
          });
          throw error;
        }
      },

      setCurrentPage: (page) => {
        set({ currentPage: page });
      },

      clearError: () => {
        set({ error: null });
      },

      getCanvasState: async (projectId: string, pageId: string) => {
        try {
          const canvasState = await projectService.getCanvasState(projectId, pageId);
          return canvasState;
        } catch (error: any) {
          set({ 
            error: error.message || 'Failed to fetch canvas state'
          });
          throw error;
        }
      }
    }),
    {
      name: 'project-store',
      partialize: (state) => ({
        currentProject: state.currentProject,
        currentPage: state.currentPage
      })
    }
  )
);
