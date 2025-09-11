import React, { useEffect } from 'react';
import ComponentPalette from '../components/ComponentPalette';
import Canvas from '../components/Canvas';
import PropertiesPanel from '../components/PropertiesPanel';
import useBuilderStore from '../store/builderStore';
import { Page } from '../types';

const Builder: React.FC = () => {
  const { currentPage, setCurrentPage } = useBuilderStore();

  // Initialize with a default page if none exists
  useEffect(() => {
    if (!currentPage) {
      const defaultPage: Page = {
        id: 'page_1',
        name: 'Home',
        components: [],
        styles: {}
      };
      setCurrentPage(defaultPage);
    }
  }, [currentPage, setCurrentPage]);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Component Palette */}
      <ComponentPalette />

      {/* Canvas Area */}
      <Canvas />

      {/* Properties Panel */}
      <PropertiesPanel />
    </div>
  );
};

export default Builder;
