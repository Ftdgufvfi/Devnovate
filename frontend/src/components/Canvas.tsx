import React, { useRef, useState, useEffect } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { Play } from 'lucide-react';
import useBuilderStore from '../store/builderStore';
import RenderableComponent from './RenderableComponent';
import ReactSandbox from './ReactSandbox';
import { Component } from '../types';

// Module declaration to fix TypeScript isolated modules error
export {};

interface CanvasProps {
  className?: string;
  pageId?: string;
  projectId: string; // Make required instead of optional
}

const Canvas: React.FC<CanvasProps> = ({ className = '', pageId, projectId }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showReactSandbox, setShowReactSandbox] = useState(false);
  const [aiGeneratedCode, setAiGeneratedCode] = useState<any>(null);
  
  // Debug logging for Canvas props
  console.log('Canvas component props:', {
    pageId,
    projectId,
    hasPageId: !!pageId,
    hasProjectId: !!projectId
  });

  const { 
    currentPage, 
    addComponent, 
    updateComponent,
    setSelectedComponent,
    selectedComponent 
  } = useBuilderStore();

  // Clear selected component when Canvas unmounts
  useEffect(() => {
    return () => {
      setSelectedComponent(null);
    };
  }, [setSelectedComponent]);

  // Clear selected component when currentPage changes  
  useEffect(() => {
    setSelectedComponent(null);
  }, [currentPage?.id, setSelectedComponent]);

  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: ['component', 'canvas-component'],
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      
      if (offset && canvasRect) {
        const snapSize = 5;
        let xPercent = ((offset.x - canvasRect.left) / canvasRect.width) * 100;
        let yPercent = ((offset.y - canvasRect.top) / canvasRect.height) * 100;
        
        // Get component width for boundary calculation
        let componentWidth = 200; // default
        if (item.componentType) {
          componentWidth = item.defaultProps?.width || 200;
        } else if (item.id) {
          // For existing components, we need to get their current width
          const existingComponent = currentPage?.components.find(c => c.id === item.id);
          componentWidth = existingComponent?.width || existingComponent?.props?.width || 200;
        }
        
        // Calculate maximum allowed xPercent based on component width
        const componentWidthPercent = (componentWidth / canvasRect.width) * 100;
        const maxXPercent = Math.max(0, 97 - componentWidthPercent); // Allow up to 97% (3% margin)
        
        // Apply snapping
        xPercent = Math.round(xPercent / snapSize) * snapSize;
        yPercent = Math.round(yPercent / snapSize) * snapSize;
        
        // Apply intelligent boundary constraints with minimal margins
        xPercent = Math.max(0, Math.min(maxXPercent, xPercent));
        yPercent = Math.max(0, Math.min(98, yPercent)); // Allow up to 98% (2% bottom margin)
        
        const position = {
          x: offset.x - canvasRect.left - 8,
          y: offset.y - canvasRect.top - 8,
          xPercent,
          yPercent
        };

        if (item.componentType) {
          if (!monitor.didDrop()) {
            const newComponent: Component = {
              id: `${item.componentType}_${Date.now()}`,
              type: item.componentType,
              props: item.defaultProps || {},
              position,
              width: item.defaultProps?.width || 200,
              height: item.defaultProps?.height || 100
            };
            addComponent(newComponent);
          }
        } else if (item.id && item.type === 'canvas-component') {
          updateComponent(item.id, { position });
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }));

  const handleComponentClick = (component: Component, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedComponent(component);
  };

  const handleCanvasClick = () => {
    setSelectedComponent(null);
  };

  const generateComponentJSX = () => {
    if (!currentPage || currentPage.components.length === 0) return '';
    
    const components = currentPage.components;
    
    const componentCode = components.map(comp => {
      const styles: string[] = [];
      
      if (comp.position) {
        if (comp.position.xPercent !== undefined && comp.position.yPercent !== undefined) {
          styles.push(`left: '${comp.position.xPercent}%'`);
          styles.push(`top: '${comp.position.yPercent}%'`);
        } else {
          styles.push(`left: '${comp.position.x}px'`);
          styles.push(`top: '${comp.position.y}px'`);
        }
        styles.push('position: "absolute"');
      }
      
      if (comp.width) styles.push(`width: '${comp.width}px'`);
      if (comp.height) styles.push(`height: '${comp.height}px'`);
      
      const styleAttr = styles.length > 0 ? ` style={{ ${styles.join(', ')} }}` : '';
      
      switch (comp.type) {
        case 'Button':
          return `<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"${styleAttr}>
        ${comp.props.text || 'Button'}
      </button>`;
        
        case 'Text':
          return `<p className="text-gray-900"${styleAttr}>${comp.props.content || 'Text'}</p>`;
        
        case 'Image':
          return `<img 
        src="${comp.props.src || 'https://via.placeholder.com/300x200'}" 
        alt="${comp.props.alt || 'Image'}"
        className="rounded-lg object-cover"${styleAttr}
      />`;
        
        case 'Card':
          return `<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"${styleAttr}>
        ${comp.props.showImage ? `<img src="${comp.props.imageSrc || 'https://via.placeholder.com/400x200'}" alt="${comp.props.imageAlt || 'Card image'}" className="w-full h-32 object-cover" />` : ''}
        <div className="p-4">
          ${comp.props.title ? `<h3 className="text-lg font-semibold text-gray-900 mb-2">${comp.props.title}</h3>` : ''}
          ${comp.props.content ? `<p className="text-gray-600">${comp.props.content}</p>` : ''}
        </div>
      </div>`;

        case 'Navbar':
          const navItems = Array.isArray(comp.props.items) ? comp.props.items : ['Home', 'About', 'Services', 'Contact'];
          return `<nav className="px-4 py-3 rounded-lg" style={{
        backgroundColor: '${comp.props.backgroundColor || '#3b82f6'}',
        color: '${comp.props.textColor || '#ffffff'}',
        ${styles.join(', ')}
      }}>
        <div className="flex items-center justify-between">
          <div className="font-bold text-lg">
            ${comp.props.brand || 'Brand'}
          </div>
          <ul className="flex space-x-6 text-sm">
            ${navItems.map(item => `<li><a href="#" className="hover:opacity-75 transition-opacity">${item}</a></li>`).join('\n            ')}
          </ul>
        </div>
      </nav>`;

        case 'Header':
          return `<header className="px-4 py-4 rounded-lg border" style={{
        backgroundColor: '${comp.props.backgroundColor || '#ffffff'}',
        color: '${comp.props.textColor || '#1f2937'}',
        borderColor: '#e5e7eb',
        ${styles.join(', ')}
      }}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold">${comp.props.title || 'Website Title'}</h1>
            ${comp.props.subtitle ? `<p className="text-sm opacity-75">${comp.props.subtitle}</p>` : ''}
          </div>
          ${comp.props.showNavigation ? `<nav className="ml-4">
            <ul className="flex space-x-4 text-sm">
              <li><a href="#" className="hover:opacity-75">Home</a></li>
              <li><a href="#" className="hover:opacity-75">About</a></li>
              <li><a href="#" className="hover:opacity-75">Contact</a></li>
            </ul>
          </nav>` : ''}
        </div>
      </header>`;

        case 'Footer':
          const socialLinks = Array.isArray(comp.props.socialLinks) ? comp.props.socialLinks : ['Facebook', 'Twitter', 'LinkedIn'];
          return `<footer className="px-4 py-4 rounded-lg text-center" style={{
        backgroundColor: '${comp.props.backgroundColor || '#1f2937'}',
        color: '${comp.props.textColor || '#ffffff'}',
        ${styles.join(', ')}
      }}>
        <div className="mb-2">
          <p className="text-sm">
            ${comp.props.copyrightText || '© 2025 Your Company. All rights reserved.'}
          </p>
        </div>
        ${comp.props.showSocialLinks ? `<div className="flex justify-center space-x-4 text-xs">
          ${socialLinks.map(link => `<a href="#" className="hover:opacity-75 transition-opacity">${link}</a>`).join('\n          ')}
        </div>` : ''}
      </footer>`;
        
        default:
          return `<div${styleAttr}>Unknown component: ${comp.type}</div>`;
      }
    }).join('\n\n      ');

    return componentCode;
  };

  const isActive = isOver && canDrop;

  return (
    <>
      <div className={`flex-1 bg-gray-100 p-8 ${className} relative`}>
        <div 
          ref={(node) => {
            drop(node);
            if (canvasRef.current !== node) {
              (canvasRef as any).current = node;
            }
          }}
          onClick={handleCanvasClick}
          data-canvas="true"
          className={`bg-white rounded-lg shadow-sm border-2 border-dashed h-full min-h-[600px] p-2 transition-colors relative overflow-hidden ${
            isActive 
              ? 'border-primary-400 bg-primary-50' 
              : canDrop 
                ? 'border-gray-300' 
                : 'border-gray-200'
          }`}
          style={{ 
            position: 'relative',
            backgroundImage: isActive || canDrop ? 
              'radial-gradient(circle, rgba(59, 130, 246, 0.3) 1px, transparent 1px)' : 
              'radial-gradient(circle, rgba(0,0,0,0.05) 0.5px, transparent 0.5px)',
            backgroundSize: isActive || canDrop ? '40px 40px' : '20px 20px'
          }}
        >
          {currentPage && currentPage.components.length > 0 ? (
            <>
              {currentPage.components.map((component) => (
                <DraggableCanvasComponent
                  key={component.id}
                  component={component}
                  onClick={handleComponentClick}
                  isSelected={selectedComponent?.id === component.id}
                />
              ))}
            </>
          ) : (
            <div className="flex items-center justify-center h-full pointer-events-none">
              <div className="text-center">
                <div className="mb-4">
                  <svg 
                    className="mx-auto h-12 w-12 text-gray-400" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1} 
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Drop Components Anywhere
                </h3>
                <p className="text-gray-500 max-w-sm">
                  Drag components from the left panel and drop them anywhere on this canvas. 
                  Click and drag components to reposition them.
                </p>
                {isActive && (
                  <div className="mt-4 text-primary-600 font-medium">
                    Drop component here!
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* React Sandbox for AI Generated Code */}
      <ReactSandbox
        isOpen={showReactSandbox}
        onClose={() => setShowReactSandbox(false)}
        components={currentPage?.components || []}
        jsxCode={generateComponentJSX()}
        pageId={pageId}
        projectId={projectId}
        onCodeUpdate={(newCode) => {
          setAiGeneratedCode({ main: newCode });
        }}
      />
    </>
  );
};

// Draggable Canvas Component
const DraggableCanvasComponent: React.FC<{
  component: Component;
  onClick: (component: Component, event: React.MouseEvent) => void;
  isSelected: boolean;
}> = ({ component, onClick, isSelected }) => {
  const { updateComponent } = useBuilderStore();
  const [isResizing, setIsResizing] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'canvas-component',
    item: { id: component.id, type: 'canvas-component' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      e.stopPropagation();
      onClick(component, e);
    }
  };

  // Resize functionality
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = component.width || component.props.width || 200;
    const startHeight = component.height || component.props.height || 100;

    // Get canvas reference for boundary calculations
    const canvasElement = document.querySelector('[data-canvas="true"]') as HTMLElement;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;

      switch (direction) {
        case 'se':
          newWidth = startWidth + deltaX;
          newHeight = startHeight + deltaY;
          break;
        case 'sw':
          newWidth = startWidth - deltaX;
          newHeight = startHeight + deltaY;
          break;
        case 'ne':
          newWidth = startWidth + deltaX;
          newHeight = startHeight - deltaY;
          break;
        case 'nw':
          newWidth = startWidth - deltaX;
          newHeight = startHeight - deltaY;
          break;
        case 'e':
          newWidth = startWidth + deltaX;
          break;
        case 'w':
          newWidth = startWidth - deltaX;
          break;
        case 'n':
          newHeight = startHeight - deltaY;
          break;
        case 's':
          newHeight = startHeight + deltaY;
          break;
      }

      // Apply minimum size constraints
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(30, newHeight);
      
      // Apply maximum size constraints based on canvas and component position
      if (canvasElement) {
        const canvasRect = canvasElement.getBoundingClientRect();
        const currentXPercent = component.position?.xPercent || 0;
        const currentYPercent = component.position?.yPercent || 0;
        
        // Calculate maximum allowed width based on current position
        const remainingWidthPercent = 100 - currentXPercent;
        const maxAllowedWidth = (remainingWidthPercent / 100) * canvasRect.width;
        
        // Calculate maximum allowed height based on current position  
        const remainingHeightPercent = 100 - currentYPercent;
        const maxAllowedHeight = (remainingHeightPercent / 100) * canvasRect.height;
        
        // Apply canvas boundary constraints with minimal margins (2-3%)
        newWidth = Math.min(newWidth, maxAllowedWidth - 10); // 10px margin (~2-3% depending on canvas size)
        newHeight = Math.min(newHeight, maxAllowedHeight - 10); // 10px margin (~2-3% depending on canvas size)
      }

      updateComponent(component.id, {
        width: Math.round(newWidth),
        height: Math.round(newHeight),
        props: {
          ...component.props,
          width: Math.round(newWidth),
          height: Math.round(newHeight)
        }
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={drag}
      onClick={handleClick}
      className={`absolute cursor-move transition-all ${
        isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''
      } ${isDragging ? 'opacity-50 transform scale-105' : ''} ${
        isResizing ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        left: component.position?.xPercent !== undefined 
          ? `${component.position.xPercent}%` 
          : `${component.position?.x || 0}px`,
        top: component.position?.yPercent !== undefined 
          ? `${component.position.yPercent}%` 
          : `${component.position?.y || 0}px`,
        width: component.width || component.props.width || 'auto',
        height: component.height || component.props.height || 'auto',
        zIndex: isSelected ? 100 : 1
      }}
    >
      <RenderableComponent component={component} />
      
      {/* Resize handles */}
      {isSelected && !isDragging && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Corner handles */}
          <div 
            className="absolute -top-2 -left-2 w-4 h-4 bg-primary-500 rounded-full cursor-nw-resize border-2 border-white shadow-lg hover:bg-primary-600 hover:scale-110 transition-all pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'nw')}
            style={{ zIndex: 1000 }}
          ></div>
          <div 
            className="absolute -top-2 -right-2 w-4 h-4 bg-primary-500 rounded-full cursor-ne-resize border-2 border-white shadow-lg hover:bg-primary-600 hover:scale-110 transition-all pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'ne')}
            style={{ zIndex: 1000 }}
          ></div>
          <div 
            className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary-500 rounded-full cursor-sw-resize border-2 border-white shadow-lg hover:bg-primary-600 hover:scale-110 transition-all pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'sw')}
            style={{ zIndex: 1000 }}
          ></div>
          <div 
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary-500 rounded-full cursor-se-resize border-2 border-white shadow-lg hover:bg-primary-600 hover:scale-110 transition-all pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
            style={{ zIndex: 1000 }}
          ></div>
          
          {/* Edge handles */}
          <div 
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-500 rounded-full cursor-n-resize border-2 border-white shadow-lg hover:bg-primary-600 hover:scale-110 transition-all pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'n')}
            style={{ zIndex: 1000 }}
          ></div>
          <div 
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary-500 rounded-full cursor-s-resize border-2 border-white shadow-lg hover:bg-primary-600 hover:scale-110 transition-all pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 's')}
            style={{ zIndex: 1000 }}
          ></div>
          <div 
            className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 bg-primary-500 rounded-full cursor-w-resize border-2 border-white shadow-lg hover:bg-primary-600 hover:scale-110 transition-all pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'w')}
            style={{ zIndex: 1000 }}
          ></div>
          <div 
            className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 bg-primary-500 rounded-full cursor-e-resize border-2 border-white shadow-lg hover:bg-primary-600 hover:scale-110 transition-all pointer-events-auto"
            onMouseDown={(e) => handleResizeStart(e, 'e')}
            style={{ zIndex: 1000 }}
          ></div>
          
          {/* Position and size indicator */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded text-center whitespace-nowrap pointer-events-none shadow-lg">
            Pos: {component.position?.xPercent !== undefined 
              ? `${Math.round(component.position.xPercent)}%, ${Math.round(component.position.yPercent || 0)}%`
              : `${component.position?.x || 0}px, ${component.position?.y || 0}px`
            } | Size: {component.width || component.props.width || '?'} × {component.height || component.props.height || '?'}
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;
