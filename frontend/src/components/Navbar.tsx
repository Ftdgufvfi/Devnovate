import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Home, Folder, Code } from 'lucide-react';
import CodeGeneratorModal from './CodeGeneratorModal';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AI Builder</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/') && location.pathname === '/' 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            
            <Link 
              to="/projects" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/projects') 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Folder className="w-4 h-4" />
              <span>Projects</span>
            </Link>
            
            <Link 
              to="/builder" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/builder') 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Builder</span>
            </Link>
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          {isActive('/builder') && (
            <button 
              onClick={() => setShowCodeGenerator(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>Generate Code</span>
            </button>
          )}
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            Create Project
          </button>
        </div>
      </div>
      
      {/* Code Generator Modal */}
      <CodeGeneratorModal 
        isOpen={showCodeGenerator}
        onClose={() => setShowCodeGenerator(false)}
      />
    </nav>
  );
};

export default Navbar;
