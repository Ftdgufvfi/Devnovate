import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft,
  Plus, 
  Search, 
  Grid, 
  List, 
  Calendar,
  Globe,
  Edit3,
  Trash2,
  Eye,
  Code,
  MoreVertical,
  Rocket,
  FileText,
  Settings,
  Share2,
  Download,
  Copy,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useProjectStore } from '../store/projectStore';
import { Page, Project } from '../types';
import CodeViewerModal from '../components/CodeViewerModal';
import { projectService } from '../services/projectService';

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { 
    projects,
    currentProject, 
    isLoading, 
    error, 
    fetchProjects,
    createPage, 
    deletePage,
    setCurrentProject,
    clearError 
  } = useProjectStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);
  const [showDeletePageModal, setShowDeletePageModal] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [codeViewerPage, setCodeViewerPage] = useState<Page | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Load project data
  useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setCurrentProject(project);
      } else {
        // If project not found in store, fetch all projects
        fetchProjects();
      }
    }
  }, [projectId, projects, setCurrentProject, fetchProjects]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Filter pages based on search term
  const filteredPages = currentProject?.pages.filter(page =>
    page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleCreatePage = async (name: string, description: string, endpoint: string) => {
    if (!currentProject) return;
    
    try {
      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      await createPage(currentProject.id, { 
        name, 
        description, 
        endpoint,
        slug,
        order: currentProject.pages.length,
        isPublished: false
      });
      toast.success('Page created successfully!');
      setShowCreatePageModal(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create page');
    }
  };

  const handleDeletePage = async () => {
    if (!selectedPage || !currentProject) return;
    
    try {
      await deletePage(currentProject.id, selectedPage.id);
      toast.success('Page deleted successfully!');
      setShowDeletePageModal(false);
      setSelectedPage(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete page');
    }
  };

  const openPageEditor = (page: Page) => {
    navigate(`/builder/${currentProject?.id}/${page.id}`);
  };

  const deployWebsite = async () => {
    if (!currentProject) return;
    
    setIsDeploying(true);
    try {
      // Simulate deployment process
      console.log('Deploying website:', currentProject.name);
      
      // Here you would integrate with actual deployment service (Vercel, Netlify, etc.)
      // For now, we'll simulate the deployment
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const deploymentUrl = `https://${currentProject.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.vercel.app`;
      
      alert(`🚀 Website deployed successfully!\n\nLive URL: ${deploymentUrl}`);
      
      // You could also update the project with the deployment URL
      // await updateProject(currentProject.id, { deploymentUrl });
      
    } catch (error) {
      console.error('Deployment failed:', error);
      alert('❌ Deployment failed. Please try again.');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleViewCode = (page: Page) => {
    setCodeViewerPage(page);
    setShowCodeViewer(true);
  };

  const handleDownloadProject = async () => {
    if (!currentProject) return;
    
    setIsDownloading(true);
    try {
      await projectService.downloadProject(currentProject.id);
      toast.success('Project downloaded successfully!');
    } catch (error: any) {
      console.error('Download failed:', error);
      toast.error(error.message || 'Failed to download project');
    } finally {
      setIsDownloading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate('/projects')}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/projects')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  {currentProject.name}
                  {currentProject.isPublished && (
                    <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Published
                    </span>
                  )}
                </h1>
                <p className="text-gray-600 mt-1">
                  {currentProject.description || 'Manage pages and content for this project'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {currentProject.isPublished && currentProject.publishedUrl && (
                <a
                  href={currentProject.publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Live
                </a>
              )}
              
              <button
                onClick={() => navigate(`/projects/${currentProject.id}/tables`)}
                className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
              >
                <Grid className="h-4 w-4" />
                Manage Tables
              </button>
              
              <button
                onClick={() => setShowProjectSettings(true)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownloadProject}
                disabled={isDownloading}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Download Project
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreatePageModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <Plus className="h-5 w-5" />
                New Page
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={deployWebsite}
                disabled={isDeploying}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeploying ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="h-5 w-5" />
                    Deploy Website
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-2xl font-bold text-gray-900">{currentProject.pages.length}</div>
            <div className="text-sm text-gray-600">Total Pages</div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-2xl font-bold text-gray-900">
              {formatDate(currentProject.updatedAt)}
            </div>
            <div className="text-sm text-gray-600">Last Updated</div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-2xl font-bold text-gray-900">
              {currentProject.isPublished ? 'Live' : 'Draft'}
            </div>
            <div className="text-sm text-gray-600">Status</div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="text-2xl font-bold text-gray-900">
              {formatDate(currentProject.createdAt)}
            </div>
            <div className="text-sm text-gray-600">Created</div>
          </div>
        </div>

        {/* Pages */}
        {filteredPages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm ? 'No pages found' : 'No pages yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Create your first page to start building your website'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreatePageModal(true)}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
              >
                <Plus className="h-5 w-5" />
                Create Your First Page
              </button>
            )}
          </motion.div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            <AnimatePresence>
              {filteredPages.map((page, index) => (
                <PageCard
                  key={page.id}
                  page={page}
                  viewMode={viewMode}
                  index={index}
                  onOpen={() => openPageEditor(page)}
                  onDelete={() => {
                    setSelectedPage(page);
                    setShowDeletePageModal(true);
                  }}
                  onViewCode={handleViewCode}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Page Modal */}
      <CreatePageModal
        isOpen={showCreatePageModal}
        onClose={() => setShowCreatePageModal(false)}
        onCreate={handleCreatePage}
        isLoading={isLoading}
      />

      {/* Delete Page Modal */}
      <DeletePageModal
        isOpen={showDeletePageModal}
        page={selectedPage}
        onClose={() => {
          setShowDeletePageModal(false);
          setSelectedPage(null);
        }}
        onDelete={handleDeletePage}
        isLoading={isLoading}
      />

      {/* Code Viewer Modal */}
      {codeViewerPage && (
        <CodeViewerModal
          isOpen={showCodeViewer}
          onClose={() => {
            setShowCodeViewer(false);
            setCodeViewerPage(null);
          }}
          page={codeViewerPage}
        />
      )}
    </div>
  );
};

// Page Card Component
interface PageCardProps {
  page: Page;
  viewMode: 'grid' | 'list';
  index: number;
  onOpen: () => void;
  onDelete: () => void;
  onViewCode: (page: Page) => void;
}

const PageCard: React.FC<PageCardProps> = ({ 
  page, 
  viewMode, 
  index, 
  onOpen, 
  onDelete,
  onViewCode
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const cardContent = (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            {page.name}
          </h3>
          {page.endpoint && (
            <p className="text-blue-600 text-xs font-mono mb-1 bg-blue-50 px-2 py-1 rounded inline-block">
              {page.endpoint}
            </p>
          )}
          {page.description && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {page.description}
            </p>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border z-10 py-1 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewCode(page);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Code className="h-4 w-4" />
                View Code
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(page.slug);
                  toast.success('Page URL copied!');
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy URL
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span>/{page.slug}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(page.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {page.isPublished && (
          <div className="flex items-center gap-1 text-green-600">
            <Globe className="h-4 w-4" />
            <span>Published</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          Edit Page
        </button>
      </div>
    </>
  );

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ delay: index * 0.05 }}
        onClick={onOpen}
        className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 p-6 cursor-pointer"
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      onClick={onOpen}
      className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-200 p-6 cursor-pointer group"
    >
      {cardContent}
    </motion.div>
  );
};

// Create Page Modal
interface CreatePageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, endpoint: string) => void;
  isLoading: boolean;
}

const CreatePageModal: React.FC<CreatePageModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  isLoading
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [endpoint, setEndpoint] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && endpoint.trim()) {
      onCreate(name.trim(), description.trim(), endpoint.trim());
      setName('');
      setDescription('');
      setEndpoint('');
    }
  };

  // Auto-generate endpoint from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (!endpoint || endpoint === '/' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) {
      const newEndpoint = '/' + value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      setEndpoint(newEndpoint === '/' ? '/' : newEndpoint);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Create New Page
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter page name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endpoint *
            </label>
            <input
              type="text"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="/page-url"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              The URL path for this page (e.g., /about, /contact)
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter page description (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Page'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Delete Page Modal
interface DeletePageModalProps {
  isOpen: boolean;
  page: Page | null;
  onClose: () => void;
  onDelete: () => void;
  isLoading: boolean;
}

const DeletePageModal: React.FC<DeletePageModalProps> = ({
  isOpen,
  page,
  onClose,
  onDelete,
  isLoading
}) => {
  if (!isOpen || !page) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 p-2 rounded-full">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Delete Page
          </h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "<strong>{page.name}</strong>"? 
          This action cannot be undone and will permanently delete all components and content.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Deleting...' : 'Delete Page'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetail;
