import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { tableService, CustomTable, TableRecord, PaginatedRecords } from '../services/tableService';

const DataManager: React.FC = () => {
  const { projectId, tableId } = useParams<{ projectId: string; tableId: string }>();
  const navigate = useNavigate();
  const [table, setTable] = useState<CustomTable | null>(null);
  const [data, setData] = useState<PaginatedRecords | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TableRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showApiEndpoints, setShowApiEndpoints] = useState(false);

  const copyToClipboard = (text: string) => {
    const baseURL = 'http://localhost:5000';
    const fullURL = text.startsWith('/') ? baseURL + text : text;
    navigator.clipboard.writeText(fullURL).then(() => {
      toast.success('Copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  useEffect(() => {
    if (projectId && tableId) {
      loadTableAndData();
    }
  }, [projectId, tableId, currentPage]);

  const loadTableAndData = async () => {
    try {
      if (!projectId || !tableId) return;
      
      const [tableData, recordsData] = await Promise.all([
        tableService.getTable(projectId, tableId),
        tableService.getRecords(tableId, { page: currentPage, limit: 10 })
      ]);
      
      setTable(tableData);
      setData(recordsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (recordData: Record<string, any>) => {
    try {
      if (!tableId) return;
      
      const loadingToast = toast.loading('Creating record...');
      
      await tableService.createRecord(tableId, recordData);
      await loadTableAndData();
      setShowCreateModal(false);
      
      toast.dismiss(loadingToast);
      toast.success('Record created successfully!');
    } catch (error) {
      console.error('Error creating record:', error);
      toast.error(`Failed to create record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateRecord = async (recordId: string, updates: Record<string, any>) => {
    try {
      if (!tableId) return;
      
      const loadingToast = toast.loading('Updating record...');
      
      await tableService.updateRecord(tableId, recordId, updates);
      await loadTableAndData();
      setEditingRecord(null);
      
      toast.dismiss(loadingToast);
      toast.success('Record updated successfully!');
    } catch (error) {
      console.error('Error updating record:', error);
      toast.error(`Failed to update record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }
    
    try {
      if (!tableId) return;
      
      const loadingToast = toast.loading('Deleting record...');
      
      await tableService.deleteRecord(tableId, recordId);
      await loadTableAndData();
      
      toast.dismiss(loadingToast);
      toast.success('Record deleted successfully!');
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error(`Failed to delete record: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!table || !data) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-900 mb-2">Table not found</h3>
        <button
          onClick={() => navigate(`/projects/${projectId}/tables`)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Tables
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(`/projects/${projectId}/tables`)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Tables
          </button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{table.displayName}</h1>
        <p className="text-gray-600">Manage records in your {table.displayName} table.</p>
        
        <div className="mt-4">
          <button
            onClick={() => setShowApiEndpoints(!showApiEndpoints)}
            className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2"
          >
            🔗 {showApiEndpoints ? 'Hide' : 'Show'} API Endpoints
          </button>
        </div>
      </div>

      {/* API Endpoints Section */}
      {showApiEndpoints && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📡 API Endpoints</h2>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Base URL:</strong> <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:5000</code>
            </p>
            <p className="text-sm text-blue-600">
              Use these endpoints to integrate {table.displayName} data into your frontend applications:
            </p>
          </div>
          
          <div className="space-y-4">
            {/* Get All Records */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Get All Records</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">GET</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-3 py-2 rounded flex-1 overflow-x-auto">
                  GET /api/data/{tableId}?page=1&limit=10
                </code>
                <button
                  onClick={() => copyToClipboard(`/api/data/${tableId}?page=1&limit=10`)}
                  className="text-gray-500 hover:text-gray-700 px-2 py-1 text-xs"
                  title="Copy endpoint"
                >
                  📋
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Retrieves paginated records from the table</p>
            </div>

            {/* Get Single Record */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Get Single Record</h3>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">GET</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-3 py-2 rounded flex-1 overflow-x-auto">
                  GET /api/data/{tableId}/&#123;recordId&#125;
                </code>
                <button
                  onClick={() => copyToClipboard(`/api/data/${tableId}/{recordId}`)}
                  className="text-gray-500 hover:text-gray-700 px-2 py-1 text-xs"
                  title="Copy endpoint"
                >
                  📋
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Retrieves a specific record by ID</p>
            </div>

            {/* Create Record */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Create Record</h3>
                <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded">POST</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-3 py-2 rounded flex-1 overflow-x-auto">
                  POST /api/data/{tableId}
                </code>
                <button
                  onClick={() => copyToClipboard(`/api/data/${tableId}`)}
                  className="text-gray-500 hover:text-gray-700 px-2 py-1 text-xs"
                  title="Copy endpoint"
                >
                  📋
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2 mt-2">Creates a new record with the provided data</p>
              <div className="text-xs text-gray-500">
                <div className="flex items-center justify-between mb-1">
                  <strong>Body example:</strong>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(
                      table.fields.reduce((acc, field) => {
                        acc[field.name] = field.type === 'number' ? 0 : 
                                          field.type === 'boolean' ? false :
                                          field.type === 'date' ? '2025-09-14' : 
                                          `sample_${field.name}`;
                        return acc;
                      }, {} as Record<string, any>), 
                      null, 
                      2
                    ))}
                    className="text-gray-500 hover:text-gray-700 px-1 text-xs"
                    title="Copy example body"
                  >
                    📋
                  </button>
                </div>
                <pre className="bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
{JSON.stringify(
  table.fields.reduce((acc, field) => {
    acc[field.name] = field.type === 'number' ? 0 : 
                      field.type === 'boolean' ? false :
                      field.type === 'date' ? '2025-09-14' : 
                      `sample_${field.name}`;
    return acc;
  }, {} as Record<string, any>), 
  null, 
  2
)}
                </pre>
              </div>
            </div>

            {/* Update Record */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Update Record</h3>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded">PUT</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-3 py-2 rounded flex-1 overflow-x-auto">
                  PUT /api/data/{tableId}/&#123;recordId&#125;
                </code>
                <button
                  onClick={() => copyToClipboard(`/api/data/${tableId}/{recordId}`)}
                  className="text-gray-500 hover:text-gray-700 px-2 py-1 text-xs"
                  title="Copy endpoint"
                >
                  📋
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Updates an existing record with new data</p>
            </div>

            {/* Delete Record */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Delete Record</h3>
                <span className="bg-red-100 text-red-800 px-2 py-1 text-xs rounded">DELETE</span>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-3 py-2 rounded flex-1 overflow-x-auto">
                  DELETE /api/data/{tableId}/&#123;recordId&#125;
                </code>
                <button
                  onClick={() => copyToClipboard(`/api/data/${tableId}/{recordId}`)}
                  className="text-gray-500 hover:text-gray-700 px-2 py-1 text-xs"
                  title="Copy endpoint"
                >
                  📋
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Deletes a specific record by ID</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🔐 Authentication</h4>
            <p className="text-sm text-blue-800 mb-2">
              All API calls require authentication. Include your JWT token in the Authorization header:
            </p>
            <code className="text-sm bg-blue-100 px-3 py-2 rounded block">
              Authorization: Bearer YOUR_JWT_TOKEN
            </code>
          </div>

          <div className="mt-4 p-4 bg-gray-100 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">📋 Current Table Schema</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {table.fields.map((field, index) => (
                <div key={index} className="bg-white p-3 rounded border">
                  <div className="font-medium text-sm">{field.name}</div>
                  <div className="text-xs text-gray-500">{field.type}</div>
                  {field.required && <div className="text-xs text-red-600">Required</div>}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Total: {data.pagination.total} records
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Record
        </motion.button>
      </div>

      {data.records.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No records yet</h3>
          <p className="text-gray-600 mb-4">Add your first record to get started.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Record
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {table.fields.map((field) => (
                      <th
                        key={field.name}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {field.name}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </th>
                    ))}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.records.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      {table.fields.map((field) => (
                        <td key={field.name} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatFieldValue(record[field.name], field.type)}
                        </td>
                      ))}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setEditingRecord(record)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRecord(record._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 border rounded-lg ${
                      page === currentPage
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(Math.min(data.pagination.pages, currentPage + 1))}
                  disabled={currentPage === data.pagination.pages}
                  className="px-3 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Create/Edit Record Modal */}
      {(showCreateModal || editingRecord) && (
        <RecordModal
          isOpen={showCreateModal || !!editingRecord}
          onClose={() => {
            setShowCreateModal(false);
            setEditingRecord(null);
          }}
          onSubmit={editingRecord ? 
            (data) => handleUpdateRecord(editingRecord._id, data) : 
            handleCreateRecord
          }
          fields={table.fields}
          initialData={editingRecord || undefined}
          mode={editingRecord ? 'edit' : 'create'}
        />
      )}
    </div>
  );
};

const formatFieldValue = (value: any, type: string): string => {
  if (value === null || value === undefined) return '';
  
  switch (type) {
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'boolean':
      return value ? 'Yes' : 'No';
    default:
      return String(value);
  }
};

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void;
  fields: any[];
  initialData?: Record<string, any>;
  mode: 'create' | 'edit';
}

const RecordModal: React.FC<RecordModalProps> = ({ isOpen, onClose, onSubmit, fields, initialData, mode }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const defaultData: Record<string, any> = {};
      fields.forEach(field => {
        defaultData[field.name] = field.defaultValue || '';
      });
      setFormData(defaultData);
    }
  }, [initialData, fields]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Add New Record' : 'Edit Record'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderFieldInput(field, formData[field.name], (value) => updateField(field.name, value))}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {mode === 'create' ? 'Create Record' : 'Update Record'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const renderFieldInput = (field: any, value: any, onChange: (value: any) => void) => {
  const baseClasses = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseClasses} h-24 resize-vertical`}
          required={field.required}
        />
      );
    case 'number':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
          className={baseClasses}
          required={field.required}
          min={field.validation?.min}
          max={field.validation?.max}
        />
      );
    case 'email':
      return (
        <input
          type="email"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseClasses}
          required={field.required}
        />
      );
    case 'url':
      return (
        <input
          type="url"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseClasses}
          required={field.required}
        />
      );
    case 'date':
      return (
        <input
          type="date"
          value={value ? new Date(value).toISOString().split('T')[0] : ''}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
          className={baseClasses}
          required={field.required}
        />
      );
    case 'boolean':
      return (
        <select
          value={value !== undefined ? String(value) : ''}
          onChange={(e) => onChange(e.target.value === 'true')}
          className={baseClasses}
          required={field.required}
        >
          <option value="">Select...</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      );
    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseClasses}
          required={field.required}
          minLength={field.validation?.minLength}
          maxLength={field.validation?.maxLength}
          pattern={field.validation?.pattern}
        />
      );
  }
};

export default DataManager;
