import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { tableService, CustomTable, CreateTableRequest, FIELD_TYPES, CustomField, FieldTypeValue } from '../services/tableService';
import { useAuthStore } from '../store/authStore';

const TableDesigner: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [tables, setTables] = useState<CustomTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTable, setEditingTable] = useState<CustomTable | null>(null);

  useEffect(() => {
    if (projectId) {
      loadTables();
    }
  }, [projectId]);

  const loadTables = async () => {
    try {
      if (!projectId) return;
      const tablesData = await tableService.getTables(projectId);
      setTables(tablesData);
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async (tableData: CreateTableRequest) => {
    try {
      if (!projectId) return;
      
      const loadingToast = toast.loading('Creating table...');
      
      await tableService.createTable(projectId, tableData);
      await loadTables();
      setShowCreateModal(false);
      
      toast.dismiss(loadingToast);
      toast.success(`Table "${tableData.name}" created successfully!`);
    } catch (error) {
      console.error('Error creating table:', error);
      toast.error(`Failed to create table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateTable = async (tableId: string, updates: Partial<CreateTableRequest>) => {
    try {
      if (!projectId) return;
      
      const loadingToast = toast.loading('Updating table...');
      
      await tableService.updateTable(projectId, tableId, updates);
      await loadTables();
      setEditingTable(null);
      
      toast.dismiss(loadingToast);
      toast.success(`Table "${updates.name || 'table'}" updated successfully!`);
    } catch (error) {
      console.error('Error updating table:', error);
      toast.error(`Failed to update table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!window.confirm('Are you sure you want to delete this table? This will also delete all data in the table.')) {
      return;
    }
    
    try {
      if (!projectId) return;
      
      const loadingToast = toast.loading('Deleting table...');
      
      await tableService.deleteTable(projectId, tableId);
      await loadTables();
      
      toast.dismiss(loadingToast);
      toast.success('Table deleted successfully!');
    } catch (error) {
      console.error('Error deleting table:', error);
      toast.error(`Failed to delete table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleViewData = (table: CustomTable) => {
    navigate(`/projects/${projectId}/tables/${table._id}/data`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Tables</h1>
        <p className="text-gray-600">Design and manage your custom database tables for this project.</p>
      </div>

      <div className="mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <span className="text-lg">+</span>
          Create New Table
        </motion.button>
      </div>

      {tables.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No tables yet</h3>
          <p className="text-gray-600 mb-4">Create your first custom table to store and manage data.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Table
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((table) => (
            <motion.div
              key={table._id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{table.displayName}</h3>
                  <p className="text-sm text-gray-500">{table.name}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewData(table)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors flex items-center gap-1"
                    title="View and manage table data"
                  >
                    👁️ Show Table
                  </button>
                  <button
                    onClick={() => setEditingTable(table)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Edit Table"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Table"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">{table.fields.length}</span> fields
                </p>
                <div className="flex flex-wrap gap-1">
                  {table.fields.slice(0, 3).map((field) => (
                    <span
                      key={field.name}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {field.name}
                    </span>
                  ))}
                  {table.fields.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      +{table.fields.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Created {new Date(table.createdAt).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Table Modal */}
      {(showCreateModal || editingTable) && (
        <TableModal
          isOpen={showCreateModal || !!editingTable}
          onClose={() => {
            setShowCreateModal(false);
            setEditingTable(null);
          }}
          onSubmit={editingTable ? 
            (data) => handleUpdateTable(editingTable._id, data) : 
            handleCreateTable
          }
          initialData={editingTable ? {
            name: editingTable.name,
            displayName: editingTable.displayName,
            fields: editingTable.fields
          } : undefined}
          mode={editingTable ? 'edit' : 'create'}
        />
      )}
    </div>
  );
};

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTableRequest) => void;
  initialData?: CreateTableRequest;
  mode: 'create' | 'edit';
}

const TableModal: React.FC<TableModalProps> = ({ isOpen, onClose, onSubmit, initialData, mode }) => {
  const [formData, setFormData] = useState<CreateTableRequest>({
    name: '',
    displayName: '',
    fields: []
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        displayName: '',
        fields: []
      });
    }
  }, [initialData]);

  const addField = () => {
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, {
        name: '',
        type: FIELD_TYPES.TEXT,
        required: false,
        unique: false
      }]
    }));
  };

  const updateField = (index: number, updates: Partial<CustomField>) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => 
        i === index ? { ...field, ...updates } : field
      )
    }));
  };

  const removeField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Table' : 'Edit Table'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Table Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user_profiles"
                required
                pattern="^[a-zA-Z][a-zA-Z0-9_]*$"
                title="Must start with a letter and contain only letters, numbers, and underscores"
              />
              <p className="text-xs text-gray-500 mt-1">Used for API endpoints (lowercase, no spaces)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="User Profiles"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Human-readable name for the UI</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Fields</h3>
              <button
                type="button"
                onClick={addField}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
              >
                <span className="text-lg">+</span>
                Add Field
              </button>
            </div>

            {formData.fields.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No fields added yet. Click "Add Field" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.fields.map((field, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-12 gap-4 items-start">
                      <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Field Name
                        </label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(index, { name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="email"
                          required
                          pattern="^[a-zA-Z][a-zA-Z0-9_]*$"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(index, { type: e.target.value as FieldTypeValue })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(FIELD_TYPES).map(([key, value]) => (
                            <option key={value} value={value}>
                              {key.toLowerCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Default Value
                        </label>
                        <input
                          type="text"
                          value={field.defaultValue || ''}
                          onChange={(e) => updateField(index, { defaultValue: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Optional"
                        />
                      </div>
                      <div className="col-span-4 flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(index, { required: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Required</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={field.unique}
                            onChange={(e) => updateField(index, { unique: e.target.checked })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Unique</span>
                        </label>
                      </div>
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => removeField(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name || !formData.displayName || formData.fields.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {mode === 'create' ? 'Create Table' : 'Update Table'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default TableDesigner;
