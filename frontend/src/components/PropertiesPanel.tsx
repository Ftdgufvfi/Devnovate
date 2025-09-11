import React from 'react';
import useBuilderStore from '../store/builderStore';
import { Settings, Trash2, Copy } from 'lucide-react';

const PropertiesPanel: React.FC = () => {
  const { selectedComponent, currentPage, updateComponent, deleteComponent, setSelectedComponent } = useBuilderStore();

  // Validate that selectedComponent exists in current page
  const isValidSelection = selectedComponent && currentPage && 
    currentPage.components.some(comp => comp.id === selectedComponent.id);

  if (!selectedComponent || !isValidSelection) {
    // Clear invalid selection
    if (selectedComponent && !isValidSelection) {
      setSelectedComponent(null);
    }
    
    return (
      <div className="w-64 bg-white border-l border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Properties</h3>
        <div className="text-sm text-gray-500 text-center py-8">
          Select a component to edit its properties
        </div>
      </div>
    );
  }

  const handlePropChange = (propName: string, value: any) => {
    if (!selectedComponent) return;
    updateComponent(selectedComponent.id, {
      props: {
        ...selectedComponent.props,
        [propName]: value
      }
    });
  };

  const handleDimensionChange = (dimension: 'width' | 'height', value: any) => {
    if (!selectedComponent) return;
    const numValue = parseInt(value) || undefined;
    updateComponent(selectedComponent.id, {
      [dimension]: numValue,
      props: {
        ...selectedComponent.props,
        [dimension]: numValue
      }
    });
  };

  const handleStyleChange = (styleProp: string, value: any) => {
    if (!selectedComponent) return;
    updateComponent(selectedComponent.id, {
      style: {
        ...selectedComponent.style,
        [styleProp]: value
      }
    });
  };

  const handleDelete = () => {
    if (!selectedComponent) return;
    if (window.confirm('Are you sure you want to delete this component?')) {
      deleteComponent(selectedComponent.id);
    }
  };

  const renderPropertyControls = () => {
    if (!selectedComponent) return null;
    const { type, props } = selectedComponent;

    switch (type) {
      case 'Button':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text
              </label>
              <input
                type="text"
                value={props.text || ''}
                onChange={(e) => handlePropChange('text', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Variant
              </label>
              <select
                value={props.variant || 'primary'}
                onChange={(e) => handlePropChange('variant', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </label>
              <select
                value={props.size || 'medium'}
                onChange={(e) => handlePropChange('size', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        );

      case 'Text':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={props.content || ''}
                onChange={(e) => handlePropChange('content', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size
              </label>
              <select
                value={props.size || 'medium'}
                onChange={(e) => handlePropChange('size', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alignment
              </label>
              <select
                value={props.align || 'left'}
                onChange={(e) => handlePropChange('align', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight
              </label>
              <select
                value={props.weight || 'normal'}
                onChange={(e) => handlePropChange('weight', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="normal">Normal</option>
                <option value="semibold">Semibold</option>
                <option value="bold">Bold</option>
              </select>
            </div>
          </div>
        );

      case 'Image':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={props.src || ''}
                onChange={(e) => handlePropChange('src', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={props.alt || ''}
                onChange={(e) => handlePropChange('alt', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={props.width || ''}
                  onChange={(e) => handlePropChange('width', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={props.height || ''}
                  onChange={(e) => handlePropChange('height', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 'Card':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
                placeholder="Card title"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <textarea
                value={props.content || ''}
                onChange={(e) => handlePropChange('content', e.target.value)}
                placeholder="Card content"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={props.showImage || false}
                  onChange={(e) => handlePropChange('showImage', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Show Image</span>
              </label>
            </div>

            {props.showImage && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={props.imageSrc || ''}
                    onChange={(e) => handlePropChange('imageSrc', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image Alt Text
                  </label>
                  <input
                    type="text"
                    value={props.imageAlt || ''}
                    onChange={(e) => handlePropChange('imageAlt', e.target.value)}
                    placeholder="Image description"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={props.width || ''}
                  onChange={(e) => handlePropChange('width', e.target.value)}
                  placeholder="px"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={props.height || ''}
                  onChange={(e) => handlePropChange('height', e.target.value)}
                  placeholder="px"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 'Navbar':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                value={props.brand || ''}
                onChange={(e) => handlePropChange('brand', e.target.value)}
                placeholder="Brand"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Menu Items (comma separated)
              </label>
              <input
                type="text"
                value={Array.isArray(props.items) ? props.items.join(', ') : (props.items || 'Home, About, Services, Contact')}
                onChange={(e) => {
                  const items = e.target.value.split(',').map(item => item.trim()).filter(item => item);
                  handlePropChange('items', items);
                }}
                placeholder="Home, About, Services, Contact"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <input
                type="color"
                value={props.backgroundColor || '#3b82f6'}
                onChange={(e) => handlePropChange('backgroundColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Color
              </label>
              <input
                type="color"
                value={props.textColor || '#ffffff'}
                onChange={(e) => handlePropChange('textColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={props.width || ''}
                  onChange={(e) => handlePropChange('width', parseInt(e.target.value))}
                  placeholder="px"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={props.height || ''}
                  onChange={(e) => handlePropChange('height', parseInt(e.target.value))}
                  placeholder="px"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 'Header':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
                placeholder="Website Title"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={props.subtitle || ''}
                onChange={(e) => handlePropChange('subtitle', e.target.value)}
                placeholder="Your tagline here"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={props.showNavigation || false}
                  onChange={(e) => handlePropChange('showNavigation', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Show Navigation</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <input
                type="color"
                value={props.backgroundColor || '#ffffff'}
                onChange={(e) => handlePropChange('backgroundColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Color
              </label>
              <input
                type="color"
                value={props.textColor || '#1f2937'}
                onChange={(e) => handlePropChange('textColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={props.width || ''}
                  onChange={(e) => handlePropChange('width', parseInt(e.target.value))}
                  placeholder="px"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={props.height || ''}
                  onChange={(e) => handlePropChange('height', parseInt(e.target.value))}
                  placeholder="px"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        );

      case 'Footer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Copyright Text
              </label>
              <input
                type="text"
                value={props.copyrightText || ''}
                onChange={(e) => handlePropChange('copyrightText', e.target.value)}
                placeholder="© 2025 Your Company. All rights reserved."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={props.showSocialLinks || false}
                  onChange={(e) => handlePropChange('showSocialLinks', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">Show Social Links</span>
              </label>
            </div>

            {props.showSocialLinks && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Social Links (comma separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(props.socialLinks) ? props.socialLinks.join(', ') : (props.socialLinks || 'Facebook, Twitter, LinkedIn')}
                  onChange={(e) => {
                    const links = e.target.value.split(',').map(link => link.trim()).filter(link => link);
                    handlePropChange('socialLinks', links);
                  }}
                  placeholder="Facebook, Twitter, LinkedIn"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <input
                type="color"
                value={props.backgroundColor || '#1f2937'}
                onChange={(e) => handlePropChange('backgroundColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Text Color
              </label>
              <input
                type="color"
                value={props.textColor || '#ffffff'}
                onChange={(e) => handlePropChange('textColor', e.target.value)}
                className="w-full h-10 border border-gray-300 rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={props.width || ''}
                  onChange={(e) => handlePropChange('width', parseInt(e.target.value))}
                  placeholder="px"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={props.height || ''}
                  onChange={(e) => handlePropChange('height', parseInt(e.target.value))}
                  placeholder="px"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            Properties for {type} component coming soon...
          </div>
        );
    }
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Properties</h3>
          <Settings className="w-4 h-4 text-gray-500" />
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-500">Selected:</span>
          <span className="font-medium text-gray-900">{selectedComponent?.type}</span>
        </div>
      </div>

      {/* Properties Form */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderPropertyControls()}

        {/* Style Properties */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Styling</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <input
                type="color"
                value={selectedComponent?.style?.backgroundColor || '#ffffff'}
                onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                className="w-full h-8 border border-gray-300 rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Margin (px)
              </label>
              <input
                type="number"
                value={selectedComponent?.style?.margin || ''}
                onChange={(e) => handleStyleChange('margin', `${e.target.value}px`)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Padding (px)
              </label>
              <input
                type="number"
                value={selectedComponent?.style?.padding || ''}
                onChange={(e) => handleStyleChange('padding', `${e.target.value}px`)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <div className="flex space-x-2">
          <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Copy className="w-4 h-4" />
            <span>Copy</span>
          </button>
          
          <button 
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
