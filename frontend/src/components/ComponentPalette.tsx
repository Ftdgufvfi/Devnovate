import React from 'react';
import DraggableComponent, { componentLibrary } from './DraggableComponent';
import { Search } from 'lucide-react';

const ComponentPalette: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(componentLibrary.map(comp => comp.category)))];

  // Filter components based on search and category
  const filteredComponents = componentLibrary.filter((component) => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Components</h3>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <select
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {filteredComponents.map((component) => (
            <DraggableComponent key={component.type} component={component} />
          ))}
        </div>

        {filteredComponents.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-sm">
              No components found
            </div>
          </div>
        )}
      </div>

      {/* Help Section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Drag components onto the canvas to start building your interface
        </div>
      </div>
    </div>
  );
};

export default ComponentPalette;
