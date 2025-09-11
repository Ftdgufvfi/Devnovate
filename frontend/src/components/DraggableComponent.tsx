import React from 'react';
import { useDrag } from 'react-dnd';
import { Square, Type, Image, Container, Edit, MousePointer, Layout, Navigation, Minus } from 'lucide-react';

export interface ComponentDefinition {
  type: string;
  name: string;
  icon: React.ComponentType<any>;
  defaultProps: Record<string, any>;
  category: string;
  description: string;
}

export const componentLibrary: ComponentDefinition[] = [
  {
    type: 'Button',
    name: 'Button',
    icon: MousePointer,
    defaultProps: {
      text: 'Click me',
      variant: 'primary',
      size: 'medium',
      width: 120,
      height: 40
    },
    category: 'Interactive',
    description: 'Interactive button element'
  },
  {
    type: 'Text',
    name: 'Text',
    icon: Type,
    defaultProps: {
      content: 'Your text here',
      size: 'medium',
      align: 'left',
      width: 200,
      height: 60
    },
    category: 'Content',
    description: 'Text content element'
  },
  {
    type: 'Image',
    name: 'Image',
    icon: Image,
    defaultProps: {
      src: 'https://via.placeholder.com/300x200',
      alt: 'Placeholder image',
      width: 300,
      height: 200
    },
    category: 'Media',
    description: 'Image element'
  },
  {
    type: 'Container',
    name: 'Container',
    icon: Container,
    defaultProps: {
      layout: 'flex',
      direction: 'column',
      gap: 16,
      padding: 16
    },
    category: 'Layout',
    description: 'Layout container'
  },
  {
    type: 'Input',
    name: 'Input',
    icon: Edit,
    defaultProps: {
      type: 'text',
      placeholder: 'Enter text...',
      label: 'Input Field'
    },
    category: 'Form',
    description: 'Input field element'
  },
  {
    type: 'Card',
    name: 'Card',
    icon: Square,
    defaultProps: {
      title: 'Card Title',
      content: 'Card content goes here',
      showImage: true,
      width: 300,
      height: 250
    },
    category: 'Layout',
    description: 'Card component'
  },
  {
    type: 'Header',
    name: 'Header',
    icon: Layout,
    defaultProps: {
      title: 'Website Title',
      subtitle: 'Your tagline here',
      showNavigation: true,
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      width: 400,
      height: 80
    },
    category: 'Layout',
    description: 'Page header with title and navigation'
  },
  {
    type: 'Navbar',
    name: 'Navbar',
    icon: Navigation,
    defaultProps: {
      brand: 'Brand',
      items: ['Home', 'About', 'Services', 'Contact'],
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
      width: 400,
      height: 60
    },
    category: 'Navigation',
    description: 'Navigation bar with menu items'
  },
  {
    type: 'Footer',
    name: 'Footer',
    icon: Minus,
    defaultProps: {
      copyrightText: '© 2025 Your Company. All rights reserved.',
      showSocialLinks: true,
      socialLinks: ['Facebook', 'Twitter', 'LinkedIn'],
      backgroundColor: '#1f2937',
      textColor: '#ffffff',
      width: 400,
      height: 100
    },
    category: 'Layout',
    description: 'Page footer with copyright and links'
  }
];

interface DraggableComponentProps {
  component: ComponentDefinition;
}

const DraggableComponent: React.FC<DraggableComponentProps> = ({ component }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { 
      componentType: component.type,
      defaultProps: component.defaultProps
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const IconComponent = component.icon;

  return (
    <div
      ref={drag}
      className={`p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="bg-primary-100 p-2 rounded-md">
          <IconComponent className="w-4 h-4 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-gray-900">{component.name}</div>
          <div className="text-xs text-gray-500 truncate">{component.description}</div>
        </div>
      </div>
    </div>
  );
};

export default DraggableComponent;
