import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Copy, Download, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Page } from '../types';

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  page: Page;
}

const CodeViewerModal: React.FC<CodeViewerModalProps> = ({ isOpen, onClose, page }) => {
  const [activeTab, setActiveTab] = useState<'react' | 'html' | 'css' | 'canvas'>('react');

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!');
  };

  const downloadCode = (code: string, filename: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Code downloaded!');
  };

  const getCodeContent = () => {
    switch (activeTab) {
      case 'react':
        return page.reactCode || '// No React code generated yet';
      case 'html':
        return page.htmlCode || '<!-- No HTML code generated yet -->';
      case 'css':
        return page.cssCode || '/* No CSS code generated yet */';
      case 'canvas':
        return page.canvasState ? JSON.stringify(page.canvasState, null, 2) : '// No canvas state saved yet';
      default:
        return '';
    }
  };

  const getFileExtension = () => {
    switch (activeTab) {
      case 'react':
        return 'jsx';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'canvas':
        return 'json';
      default:
        return 'txt';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Code className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Generated Code - {page.name}
              </h2>
              <p className="text-sm text-gray-500">
                View and export generated code for this page
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { key: 'react', label: 'React JSX', icon: '⚛️' },
            { key: 'html', label: 'HTML', icon: '🌐' },
            { key: 'css', label: 'CSS', icon: '🎨' },
            { key: 'canvas', label: 'Canvas State', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="flex-1 flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {activeTab.toUpperCase()} Code
              </span>
              <span className="text-xs text-gray-500">
                ({page.endpoint})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(getCodeContent())}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Copy className="h-4 w-4" />
                Copy
              </button>
              <button
                onClick={() => downloadCode(
                  getCodeContent(), 
                  `${page.slug}.${getFileExtension()}`
                )}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>

          {/* Code Block */}
          <div className="flex-1 bg-gray-900 rounded-lg overflow-hidden">
            <pre className="h-full p-4 overflow-auto text-sm">
              <code className="text-gray-100 whitespace-pre-wrap">
                {getCodeContent()}
              </code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Last updated: {new Date(page.updatedAt).toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CodeViewerModal;
