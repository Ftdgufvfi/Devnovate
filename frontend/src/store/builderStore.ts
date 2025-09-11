import { create } from 'zustand';
import { BuilderState, Component, Page, Project, BackendModel, APIEndpoint } from '../types';

const useBuilderStore = create<BuilderState>((set, get) => ({
  currentProject: null,
  currentPage: null,
  selectedComponent: null,
  isPreviewMode: false,
  models: [],
  endpoints: [],

  setCurrentProject: (project: Project) => set({ currentProject: project }),
  
  setCurrentPage: (page: Page) => set({ currentPage: page }),
  
  setSelectedComponent: (component: Component | null) => set({ selectedComponent: component }),
  
  setIsPreviewMode: (isPreview: boolean) => set({ isPreviewMode: isPreview }),

  addComponent: (component: Component, parentId?: string) => {
    const { currentPage } = get();
    if (!currentPage) return;

    const addToComponents = (components: Component[]): Component[] => {
      if (!parentId) {
        return [...components, component];
      }
      
      return components.map(comp => {
        if (comp.id === parentId) {
          return {
            ...comp,
            children: [...(comp.children || []), component]
          };
        }
        if (comp.children) {
          return {
            ...comp,
            children: addToComponents(comp.children)
          };
        }
        return comp;
      });
    };

    const updatedPage = {
      ...currentPage,
      components: addToComponents(currentPage.components)
    };

    set({ currentPage: updatedPage });
  },

  updateComponent: (id: string, updates: Partial<Component>) => {
    const { currentPage } = get();
    if (!currentPage) return;

    const updateInComponents = (components: Component[]): Component[] => {
      return components.map(comp => {
        if (comp.id === id) {
          return { ...comp, ...updates };
        }
        if (comp.children) {
          return {
            ...comp,
            children: updateInComponents(comp.children)
          };
        }
        return comp;
      });
    };

    const updatedPage = {
      ...currentPage,
      components: updateInComponents(currentPage.components)
    };

    set({ currentPage: updatedPage });
  },

  deleteComponent: (id: string) => {
    const { currentPage } = get();
    if (!currentPage) return;

    const deleteFromComponents = (components: Component[]): Component[] => {
      return components
        .filter(comp => comp.id !== id)
        .map(comp => ({
          ...comp,
          children: comp.children ? deleteFromComponents(comp.children) : undefined
        }));
    };

    const updatedPage = {
      ...currentPage,
      components: deleteFromComponents(currentPage.components)
    };

    set({ currentPage: updatedPage });
  },

  addModel: (model: BackendModel) => {
    set(state => ({
      models: [...state.models, model]
    }));
  },

  updateModel: (id: string, updates: Partial<BackendModel>) => {
    set(state => ({
      models: state.models.map(model => 
        model.id === id ? { ...model, ...updates } : model
      )
    }));
  },

  deleteModel: (id: string) => {
    set(state => ({
      models: state.models.filter(model => model.id !== id),
      endpoints: state.endpoints.filter(endpoint => endpoint.modelId !== id)
    }));
  },

  addEndpoint: (endpoint: APIEndpoint) => {
    set(state => ({
      endpoints: [...state.endpoints, endpoint]
    }));
  },

  updateEndpoint: (id: string, updates: Partial<APIEndpoint>) => {
    set(state => ({
      endpoints: state.endpoints.map(endpoint => 
        endpoint.id === id ? { ...endpoint, ...updates } : endpoint
      )
    }));
  },

  deleteEndpoint: (id: string) => {
    set(state => ({
      endpoints: state.endpoints.filter(endpoint => endpoint.id !== id)
    }));
  }
}));

export default useBuilderStore;
