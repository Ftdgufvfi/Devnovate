export interface Component {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: Component[];
  style?: Record<string, any>;
  position?: { 
    x: number; 
    y: number; 
    // Add percentage support
    xPercent?: number; 
    yPercent?: number; 
  };
  // Add dimensions for resize functionality
  width?: number;
  height?: number;
}

export interface Page {
  id: string;
  name: string;
  components: Component[];
  styles: Record<string, any>;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  pages: Page[];
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  publishedUrl?: string;
}

export interface BackendModel {
  id: string;
  name: string;
  fields: ModelField[];
  relations: ModelRelation[];
}

export interface ModelField {
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'email' | 'password';
  required: boolean;
  unique: boolean;
  defaultValue?: any;
}

export interface ModelRelation {
  id: string;
  type: 'oneToOne' | 'oneToMany' | 'manyToMany';
  targetModel: string;
  fieldName: string;
}

export interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  modelId: string;
  description?: string;
}

export interface BuilderState {
  currentProject: Project | null;
  currentPage: Page | null;
  selectedComponent: Component | null;
  isPreviewMode: boolean;
  
  // Backend
  models: BackendModel[];
  endpoints: APIEndpoint[];
  
  // Actions
  setCurrentProject: (project: Project) => void;
  setCurrentPage: (page: Page) => void;
  setSelectedComponent: (component: Component | null) => void;
  setIsPreviewMode: (isPreview: boolean) => void;
  
  addComponent: (component: Component, parentId?: string) => void;
  updateComponent: (id: string, updates: Partial<Component>) => void;
  deleteComponent: (id: string) => void;
  
  addModel: (model: BackendModel) => void;
  updateModel: (id: string, updates: Partial<BackendModel>) => void;
  deleteModel: (id: string) => void;
  
  addEndpoint: (endpoint: APIEndpoint) => void;
  updateEndpoint: (id: string, updates: Partial<APIEndpoint>) => void;
  deleteEndpoint: (id: string) => void;
}
