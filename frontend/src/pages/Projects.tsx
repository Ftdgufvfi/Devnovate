import React from 'react';

const Projects: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
        <button className="btn-primary">
          Create New Project
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example project cards */}
        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4"></div>
          <h3 className="font-semibold text-gray-900 mb-2">E-commerce Store</h3>
          <p className="text-gray-600 text-sm mb-4">Online store with product catalog and checkout</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Updated 2 days ago</span>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Open
            </button>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="h-32 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg mb-4"></div>
          <h3 className="font-semibold text-gray-900 mb-2">Task Manager</h3>
          <p className="text-gray-600 text-sm mb-4">Productivity app for managing tasks and projects</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Updated 1 week ago</span>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Open
            </button>
          </div>
        </div>

        <div className="card p-6 hover:shadow-lg transition-shadow">
          <div className="h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg mb-4"></div>
          <h3 className="font-semibold text-gray-900 mb-2">Blog Platform</h3>
          <p className="text-gray-600 text-sm mb-4">Content management system for blogs</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Updated 3 weeks ago</span>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Open
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;
