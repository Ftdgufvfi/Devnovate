import api from './api';

export interface FieldType {
  TEXT: 'text';
  NUMBER: 'number';
  EMAIL: 'email';
  DATE: 'date';
  BOOLEAN: 'boolean';
  URL: 'url';
  TEXTAREA: 'textarea';
}

export const FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  EMAIL: 'email',
  DATE: 'date',
  BOOLEAN: 'boolean',
  URL: 'url',
  TEXTAREA: 'textarea'
} as const;

export type FieldTypeValue = typeof FIELD_TYPES[keyof typeof FIELD_TYPES];

export interface CustomField {
  name: string;
  type: FieldTypeValue;
  required: boolean;
  unique: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    maxLength?: number;
    minLength?: number;
  };
}

export interface CustomTable {
  _id: string;
  name: string;
  displayName: string;
  projectId: string;
  userId: string;
  fields: CustomField[];
  collectionName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTableRequest {
  name: string;
  displayName: string;
  fields: CustomField[];
}

export interface TableRecord {
  _id: string;
  [key: string]: any;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedRecords {
  records: TableRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  table: {
    id: string;
    name: string;
    displayName: string;
    fields: CustomField[];
  };
}

class TableService {
  // Table Management
  async getTables(projectId: string): Promise<CustomTable[]> {
    const response = await api.get(`/tables/${projectId}`);
    return response.data;
  }

  async getTable(projectId: string, tableId: string): Promise<CustomTable> {
    const response = await api.get(`/tables/${projectId}/${tableId}`);
    return response.data;
  }

  async createTable(projectId: string, tableData: CreateTableRequest): Promise<CustomTable> {
    const response = await api.post(`/tables/${projectId}`, tableData);
    return response.data;
  }

  async updateTable(projectId: string, tableId: string, updates: Partial<CreateTableRequest>): Promise<CustomTable> {
    const response = await api.put(`/tables/${projectId}/${tableId}`, updates);
    return response.data;
  }

  async deleteTable(projectId: string, tableId: string): Promise<void> {
    await api.delete(`/tables/${projectId}/${tableId}`);
  }

  async getTableSchema(projectId: string, tableId: string): Promise<any> {
    const response = await api.get(`/tables/${projectId}/${tableId}/schema`);
    return response.data;
  }

  // Data Management
  async getRecords(tableId: string, params?: {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  }): Promise<PaginatedRecords> {
    const response = await api.get(`/data/${tableId}`, { params });
    return response.data;
  }

  async getRecord(tableId: string, recordId: string): Promise<TableRecord> {
    const response = await api.get(`/data/${tableId}/${recordId}`);
    return response.data;
  }

  async createRecord(tableId: string, data: Record<string, any>): Promise<TableRecord> {
    const response = await api.post(`/data/${tableId}`, data);
    return response.data;
  }

  async updateRecord(tableId: string, recordId: string, data: Record<string, any>): Promise<TableRecord> {
    const response = await api.put(`/data/${tableId}/${recordId}`, data);
    return response.data;
  }

  async deleteRecord(tableId: string, recordId: string): Promise<void> {
    await api.delete(`/data/${tableId}/${recordId}`);
  }

  async bulkCreateRecords(tableId: string, records: Record<string, any>[]): Promise<{ message: string; records: TableRecord[] }> {
    const response = await api.post(`/data/${tableId}/bulk`, { records });
    return response.data;
  }

  async bulkDeleteRecords(tableId: string, recordIds: string[]): Promise<{ message: string; deletedCount: number }> {
    const response = await api.delete(`/data/${tableId}/bulk`, { data: { recordIds } });
    return response.data;
  }
}

export const tableService = new TableService();
