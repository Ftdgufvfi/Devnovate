import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { tableService, CustomTable } from '../services/tableService';

const EndpointsPanel: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [tables, setTables] = useState<CustomTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<CustomTable | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const copyToClipboard = (text: string) => {
    const baseURL = 'http://localhost:5000';
    const fullURL = text.startsWith('/') ? baseURL + text : text;
    navigator.clipboard.writeText(fullURL).then(() => {
      toast.success('Endpoint copied!');
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  const generateSampleData = (table: CustomTable) => {
    return table.fields.reduce((acc, field) => {
      acc[field.name] = field.type === 'number' ? 0 : 
                        field.type === 'boolean' ? false :
                        field.type === 'date' ? '2025-09-14' : 
                        `sample_${field.name}`;
      return acc;
    }, {} as Record<string, any>);
  };

  if (loading) {
    return (
      <div className="h-full bg-white border-l border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">🔗 API Endpoints</h3>
        <div className="text-sm text-gray-500 text-center py-8">
          Loading tables...
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">🔗 API Endpoints</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {tables.length === 0 ? (
        <div className="text-sm text-gray-500 text-center py-8">
          <p>No tables found.</p>
          <p className="mt-2">Create tables to expose API endpoints.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-gray-600 mb-3">
            <strong>Base URL:</strong>
            <div className="bg-gray-100 p-2 rounded text-xs mt-1">
              http://localhost:5000
            </div>
          </div>

          {tables.map((table) => (
            <div key={table._id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setSelectedTable(selectedTable?._id === table._id ? null : table)}
                className="w-full p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <div className="font-medium text-sm text-gray-900">{table.displayName}</div>
                <div className="text-xs text-gray-500">{table.fields.length} fields</div>
              </button>

              {selectedTable?._id === table._id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-200 p-3 space-y-3"
                >
                  {/* GET All Records */}
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-blue-900">GET All</span>
                      <button
                        onClick={() => copyToClipboard(`/api/data/${table._id}?page=1&limit=10`)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                        title="Copy endpoint"
                      >
                        📋
                      </button>
                    </div>
                    <code className="text-xs text-blue-800 break-all">
                      /api/data/{table._id}
                    </code>
                  </div>

                  {/* POST Create */}
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-green-900">POST Create</span>
                      <button
                        onClick={() => copyToClipboard(`/api/data/${table._id}`)}
                        className="text-green-600 hover:text-green-800 text-xs"
                        title="Copy endpoint"
                      >
                        📋
                      </button>
                    </div>
                    <code className="text-xs text-green-800 break-all">
                      /api/data/{table._id}
                    </code>
                    {isExpanded && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-green-700">Body example:</span>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(generateSampleData(table), null, 2))}
                            className="text-green-600 hover:text-green-800 text-xs"
                            title="Copy body example"
                          >
                            📋
                          </button>
                        </div>
                        <pre className="text-xs bg-green-100 p-2 rounded overflow-x-auto">
{JSON.stringify(generateSampleData(table), null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  {/* PUT Update */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-yellow-900">PUT Update</span>
                      <button
                        onClick={() => copyToClipboard(`/api/data/${table._id}/{recordId}`)}
                        className="text-yellow-600 hover:text-yellow-800 text-xs"
                        title="Copy endpoint"
                      >
                        📋
                      </button>
                    </div>
                    <code className="text-xs text-yellow-800 break-all">
                      /api/data/{table._id}/&#123;id&#125;
                    </code>
                  </div>

                  {/* DELETE */}
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-red-900">DELETE</span>
                      <button
                        onClick={() => copyToClipboard(`/api/data/${table._id}/{recordId}`)}
                        className="text-red-600 hover:text-red-800 text-xs"
                        title="Copy endpoint"
                      >
                        📋
                      </button>
                    </div>
                    <code className="text-xs text-red-800 break-all">
                      /api/data/{table._id}/&#123;id&#125;
                    </code>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 p-2 bg-gray-50 border border-gray-200 rounded">
                      <h5 className="text-xs font-medium text-gray-900 mb-2">🔐 Auth Required</h5>
                      <code className="text-xs text-gray-700 break-all">
                        Authorization: Bearer YOUR_JWT_TOKEN
                      </code>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          ))}

          {isExpanded && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-xs font-medium text-blue-900 mb-2">💡 Integration Tips</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Use fetch() or axios in your frontend</li>
                <li>• Include JWT token for authentication</li>
                <li>• All responses return JSON format</li>
                <li>• GET endpoints support pagination</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EndpointsPanel;
