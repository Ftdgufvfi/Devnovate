import React from 'react';
import { Component } from '../types';

interface RenderableComponentProps {
  component: Component;
}

const RenderableComponent: React.FC<RenderableComponentProps> = ({ component }) => {
  const { type, props, style, width, height } = component;

  // Debug logging to track dimension changes
  React.useEffect(() => {
    console.log('RenderableComponent dimensions:', {
      id: component.id,
      type,
      componentWidth: width,
      componentHeight: height,
      propsWidth: props.width,
      propsHeight: props.height
    });
  }, [component.id, type, width, height, props.width, props.height]);

  const combinedStyle = {
    ...style,
    // Add width and height from component properties or props fallback
    ...(width && { width: `${width}px` }),
    ...(height && { height: `${height}px` }),
    // Add some default styling
    transition: 'all 0.2s ease',
    // Ensure the component respects its container dimensions
    boxSizing: 'border-box' as const,
  };

  // Create a wrapper div to ensure dimensions are applied consistently
  // Use component-level dimensions first, fallback to props
  const componentWidth = width || props.width;
  const componentHeight = height || props.height;
  
  const wrapperStyle = {
    width: componentWidth ? `${componentWidth}px` : 'auto',
    height: componentHeight ? `${componentHeight}px` : 'auto',
    display: 'block',
    position: 'relative' as const,
    // Remove debug border in production, keep for development
    border: process.env.NODE_ENV === 'development' ? '1px dashed rgba(255, 0, 0, 0.3)' : 'none',
    // Ensure minimum dimensions to make components visible
    minWidth: componentWidth ? `${componentWidth}px` : '50px',
    minHeight: componentHeight ? `${componentHeight}px` : '30px',
  };

  switch (type) {
    case 'Button':
      return (
        <div style={wrapperStyle}>
          <button
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              props.variant === 'primary' 
                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                : props.variant === 'secondary'
                  ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            } ${
              props.size === 'small' 
                ? 'px-3 py-1 text-sm' 
                : props.size === 'large' 
                  ? 'px-6 py-3 text-lg' 
                  : 'px-4 py-2'
            }`}
            style={{
              ...combinedStyle,
              // Ensure button fills the wrapper
              width: '100%',
              height: '100%',
              minWidth: 'unset',
              minHeight: 'unset',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {props.text || 'Button'}
          </button>
        </div>
      );

    case 'Text':
      const Tag = props.tag || 'p';
      return (
        <div style={wrapperStyle}>
          <Tag
            className={`${
              props.size === 'small' 
                ? 'text-sm' 
                : props.size === 'large' 
                  ? 'text-xl' 
                  : props.size === 'xl'
                    ? 'text-2xl'
                    : 'text-base'
            } ${
              props.align === 'center' 
                ? 'text-center' 
                : props.align === 'right' 
                  ? 'text-right' 
                  : 'text-left'
            } ${
              props.weight === 'bold' 
                ? 'font-bold' 
                : props.weight === 'semibold' 
                  ? 'font-semibold' 
                  : 'font-normal'
            } text-gray-900`}
            style={{
              ...combinedStyle,
              // Fill the wrapper completely
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              wordWrap: 'break-word',
              padding: '4px'
            }}
          >
            {props.content || 'Your text here'}
          </Tag>
        </div>
      );

    case 'Image':
      return (
        <div style={wrapperStyle}>
          <img
            src={props.src || 'https://via.placeholder.com/300x200'}
            alt={props.alt || 'Image'}
            className="rounded-lg"
            style={{
              ...combinedStyle,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block'
            }}
          />
        </div>
      );

    case 'Container':
      return (
        <div style={wrapperStyle}>
          <div
            className={`${
              props.layout === 'flex' 
                ? `flex ${
                    props.direction === 'row' 
                      ? 'flex-row' 
                      : 'flex-col'
                  }` 
                : 'block'
            } rounded-lg border border-gray-200 bg-gray-50`}
            style={{
              ...combinedStyle,
              width: '100%',
              height: '100%',
              padding: props.padding || 16,
              gap: props.gap || 16,
            }}
          >
            {component.children?.map((child) => (
              <RenderableComponent key={child.id} component={child} />
            )) || (
              <div className="text-gray-500 text-sm text-center py-8">
                Drop components here
              </div>
            )}
          </div>
        </div>
      );

    case 'Input':
      return (
        <div style={wrapperStyle}>
          <div className="space-y-2 h-full flex flex-col">
            {props.label && (
              <label className="block text-sm font-medium text-gray-700">
                {props.label}
              </label>
            )}
            <input
              type={props.type || 'text'}
              placeholder={props.placeholder || 'Enter text...'}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              style={combinedStyle}
            />
          </div>
        </div>
      );

    case 'Card':
      return (
        <div style={wrapperStyle}>
          <div 
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            style={{
              ...combinedStyle,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {props.showImage && (
              <img
                src={props.imageSrc || 'https://via.placeholder.com/400x200'}
                alt={props.imageAlt || 'Card image'}
                className="w-full object-cover"
                style={{ 
                  height: props.height ? `${Math.floor((props.height || 300) * 0.6)}px` : '120px',
                  flex: '0 0 auto'
                }}
              />
            )}
            <div className="p-4 flex-1 overflow-hidden">
              {props.title && (
                <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">
                  {props.title}
                </h3>
              )}
              {props.content && (
                <p className="text-gray-600 text-xs leading-tight overflow-hidden">
                  {props.content}
                </p>
              )}
            </div>
          </div>
        </div>
      );

    case 'Header':
      return (
        <div style={wrapperStyle}>
          <header 
            className="px-4 py-4"
            style={{
              ...combinedStyle,
              width: '100%',
              height: '100%',
              backgroundColor: props.backgroundColor || '#ffffff',
              color: props.textColor || '#1f2937',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '8px',
              boxSizing: 'border-box',
              overflow: 'hidden',
              border: '1px solid #e5e7eb'
            }}
          >
            <div className="flex-1 min-w-0">
              <h1 className="text-sm lg:text-lg font-bold truncate">{props.title || 'Website Title'}</h1>
              {props.subtitle && (
                <p className="text-xs lg:text-sm opacity-75 truncate">{props.subtitle}</p>
              )}
            </div>
            {props.showNavigation && (
              <nav className="ml-4">
                <ul className="flex space-x-2 lg:space-x-4 text-xs lg:text-sm">
                  <li><a href="#" className="hover:opacity-75">Home</a></li>
                  <li><a href="#" className="hover:opacity-75">About</a></li>
                  <li><a href="#" className="hover:opacity-75">Contact</a></li>
                </ul>
              </nav>
            )}
          </header>
        </div>
      );

    case 'Navbar':
      return (
        <div style={wrapperStyle}>
          <nav 
            className="px-4 py-3"
            style={{
              ...combinedStyle,
              width: '100%',
              height: '100%',
              backgroundColor: props.backgroundColor || '#3b82f6',
              color: props.textColor || '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: '8px',
              boxSizing: 'border-box',
              overflow: 'hidden',
              minWidth: '200px'
            }}
          >
            <div className="font-bold text-sm lg:text-lg truncate">
              {props.brand || 'Brand'}
            </div>
            <ul className="flex space-x-2 lg:space-x-6 text-xs lg:text-sm">
              {(props.items || ['Home', 'About', 'Services', 'Contact']).slice(0, 4).map((item: string, index: number) => (
                <li key={index}>
                  <a href="#" className="hover:opacity-75 transition-opacity truncate">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      );

    case 'Footer':
      return (
        <div style={wrapperStyle}>
          <footer 
            className="px-4 py-4"
            style={{
              ...combinedStyle,
              width: '100%',
              height: '100%',
              backgroundColor: props.backgroundColor || '#1f2937',
              color: props.textColor || '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center' as const,
              borderRadius: '8px',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
          >
            <div className="mb-2">
              <p className="text-xs lg:text-sm">
                {props.copyrightText || '© 2025 Your Company. All rights reserved.'}
              </p>
            </div>
            {props.showSocialLinks && (
              <div className="flex space-x-2 lg:space-x-4 text-xs">
                {(props.socialLinks || ['Facebook', 'Twitter', 'LinkedIn']).slice(0, 3).map((link: string, index: number) => (
                  <a key={index} href="#" className="hover:opacity-75 transition-opacity">
                    {link}
                  </a>
                ))}
              </div>
            )}
          </footer>
        </div>
      );

    default:
      return (
        <div style={wrapperStyle}>
          <div 
            className="border-2 border-dashed border-red-300 bg-red-50 p-4 rounded-lg"
            style={{
              ...combinedStyle,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div className="text-red-600 text-sm">
              Unknown component type: {type}
            </div>
          </div>
        </div>
      );
  }
};

export default RenderableComponent;
