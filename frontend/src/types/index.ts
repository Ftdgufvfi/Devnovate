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
  slug: string;
  endpoint: string;
  title?: string;
  description?: string;
  components: Component[];
  styles: Record<string, any>;
  order: number;
  isPublished: boolean;
  // Code storage fields
  reactCode?: string;
  htmlCode?: string;
  cssCode?: string;
  canvasState?: any; // Store the canvas state as JSON
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  pages: Page[];
  settings: {
    theme?: string;
    customCSS?: string;
    favicon?: string;
    domain?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  publishedUrl?: string;
  userId?: string; // Add user ownership
}

// User Authentication Types
export interface User {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  avatar?: string;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
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
