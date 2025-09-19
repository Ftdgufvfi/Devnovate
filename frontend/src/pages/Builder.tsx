import React, { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import ComponentPalette from '../components/ComponentPalette';
import Canvas from '../components/Canvas';
import PropertiesPanel from '../components/PropertiesPanel';
import EndpointsPanel from '../components/EndpointsPanel';
import useBuilderStore from '../store/builderStore';
import { useProjectStore } from '../store/projectStore';
import { tableService } from '../services/tableService';
import { Page } from '../types';

const Builder: React.FC = () => {
  const { projectId, pageId } = useParams<{ projectId: string; pageId: string }>();
  
  // Debug logging for Builder params
  console.log('Builder useParams:', {
    projectId,
    pageId,
    hasProjectId: !!projectId,
    hasPageId: !!pageId,
    projectIdType: typeof projectId,
    pageIdType: typeof pageId,
    currentUrl: window.location.href,
    pathname: window.location.pathname
  });

  // Additional URL debugging
  const urlParts = window.location.pathname.split('/');
  console.log('URL Parts Analysis:', {
    fullPath: window.location.pathname,
    parts: urlParts,
    expectedFormat: '/builder/:projectId/:pageId',
    extractedProjectId: urlParts[2], // Should be projectId
    extractedPageId: urlParts[3]     // Should be pageId
  });
  
  const { currentPage, setCurrentPage } = useBuilderStore();
  const { currentProject, updatePage, fetchProjects, fetchProject, setCurrentProject, getCanvasState } = useProjectStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSavingCanvas, setIsSavingCanvas] = useState(false);
  const [showEndpointsPanel, setShowEndpointsPanel] = useState(false);
  const [showComponentPalette, setShowComponentPalette] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  const [tableCount, setTableCount] = useState(0);

  // Load table count for the project
  const loadTableCount = useCallback(async () => {
    if (projectId) {
      try {
        const tables = await tableService.getTables(projectId);
        setTableCount(tables.length);
      } catch (error) {
        console.error('Error loading table count:', error);
        setTableCount(0);
      }
    }
  }, [projectId]);

  // Manual save canvas function
  const saveCanvas = useCallback(async () => {
    if (!currentPage || !currentProject || !projectId) {
      console.log('Missing data for save:', { currentPage: !!currentPage, currentProject: !!currentProject, projectId });
      return;
    }

    setIsSavingCanvas(true);
    try {
      console.log('Saving canvas with components:', currentPage.components);
      console.log('Current page ID:', currentPage.id);
      console.log('Project ID:', projectId);

      // Prepare canvas state data
      const canvasState = {
        components: currentPage.components,
        styles: currentPage.styles || {},
        metadata: {
          lastSaved: new Date(),
          version: '1.0'
        }
      };

      const updateData = {
        components: currentPage.components,
        canvasState,
        styles: currentPage.styles
      };

      console.log('Sending update data:', updateData);

      // Save to backend
      const result = await updatePage(projectId, currentPage.id, updateData);
      
      console.log('Save result:', result);
      console.log('Canvas saved successfully!');
      alert('Canvas saved successfully!');
    } catch (error) {
      console.error('Failed to save canvas:', error);
      alert('Failed to save canvas: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSavingCanvas(false);
    }
  }, [currentPage, currentProject, projectId, updatePage]);

  // Load page and canvas components from backend
  useEffect(() => {
    const loadPageWithCanvas = async () => {
      if (projectId && pageId) {
        console.log('Loading page:', { projectId, pageId });
        try {
          // First load the project
          const project = await fetchProject(projectId);
          if (project) {
            setCurrentProject(project);
            
            // Load table count for endpoints panel
            await loadTableCount();
            
            // Find the page
            const page = project.pages.find(p => p.id === pageId);
            if (page) {
              console.log('Found page:', page.name);
              
              // Try to load canvas state with components
              try {
                const canvasState = await getCanvasState(projectId, pageId);
                console.log('Canvas state loaded:', canvasState);
                
                if (canvasState && canvasState.components && canvasState.components.length > 0) {
                  // Use canvas state with components
                  const pageWithComponents = {
                    ...page,
                    components: canvasState.components,
                    styles: canvasState.canvasState?.styles || {}
                  };
                  setCurrentPage(pageWithComponents);
                  console.log('Loaded page with', canvasState.components.length, 'components');
                } else {
                  // No components in canvas state, use empty page
                  setCurrentPage({ ...page, components: [], styles: {} });
                  console.log('Loaded empty page (no components found)');
                }
              } catch (canvasError) {
                console.log('Could not load canvas state:', canvasError);
                // Fallback to empty page
                setCurrentPage({ ...page, components: [], styles: {} });
              }
            } else {
              console.error('Page not found with id:', pageId);
            }
          } else {
            console.error('Project not found');
          }
        } catch (error) {
          console.error('Failed to load project:', error);
        }
      } else if (!projectId && !pageId && !currentPage) {
        // Default page for standalone builder
        const defaultPage: Page = {
          id: 'page_1',
          name: 'Home',
          slug: 'home',
          endpoint: '/',
          components: [],
          styles: {},
          order: 0,
          isPublished: false,
          reactCode: '',
          htmlCode: '',
          cssCode: '',
          canvasState: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setCurrentPage(defaultPage);
        console.log('Created default page');
      }
      
      // Set initial load to false after loading
      setIsInitialLoad(false);
    };

    loadPageWithCanvas();
  }, [projectId, pageId, fetchProject, setCurrentProject, setCurrentPage, getCanvasState]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Builder Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold text-gray-900">
            {currentPage?.name || 'Page Builder'}
          </h1>
          {currentProject && (
            <span className="text-sm text-gray-500">
              Project: {currentProject.name}
            </span>
          )}
        </div>
        
        {/* Toolbar Controls */}
        <div className="flex gap-2">
          {/* Panel Toggle Buttons */}
          <div className="flex gap-1 mr-4">
            <button
              onClick={() => setShowComponentPalette(!showComponentPalette)}
              className={`p-2 rounded transition-colors ${
                showComponentPalette 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Toggle Component Palette"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
              </svg>
            </button>
            
            <button
              onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
              className={`p-2 rounded transition-colors ${
                showPropertiesPanel 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Toggle Properties Panel"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>

            {projectId && pageId && (
              <button
                onClick={() => setShowEndpointsPanel(!showEndpointsPanel)}
                className={`flex items-center space-x-1 px-3 py-2 border rounded transition-colors ${
                  showEndpointsPanel 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                title="Toggle API Endpoints Panel"
              >
                <span>🔗</span>
                <span className="text-xs">API</span>
                {tableCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1 min-w-[16px] h-4 flex items-center justify-center">
                    {tableCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Save Canvas Button */}
          {projectId && pageId && (
            <button
              onClick={saveCanvas}
              disabled={isSavingCanvas}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {isSavingCanvas ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Save Canvas</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Builder Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Component Palette - Collapsible */}
        {showComponentPalette && (
          <div className="w-56 flex-shrink-0">
            <ComponentPalette />
          </div>
        )}

        {/* Canvas Area - Takes remaining space */}
        <div className="flex-1 min-w-0">
          {projectId ? (
            <Canvas 
              pageId={currentPage?.id}
              projectId={projectId}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Loading project...
            </div>
          )}
        </div>

        {/* Properties Panel - Collapsible */}
        {showPropertiesPanel && (
          <div className="w-56 flex-shrink-0">
            <PropertiesPanel />
          </div>
        )}

        {/* API Endpoints Panel - Collapsible and wider when needed */}
        {showEndpointsPanel && (
          <div className="w-72 flex-shrink-0">
            <EndpointsPanel />
          </div>
        )}
      </div>
    </div>
  );
};

export default Builder;
