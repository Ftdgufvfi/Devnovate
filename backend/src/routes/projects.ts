import express from 'express';

const router = express.Router();

// GET /api/projects - Get all projects
router.get('/', (req, res) => {
  try {
    // Mock data for now
    const projects = [
      {
        id: '1',
        name: 'E-commerce Store',
        description: 'Online store with product catalog and checkout',
        pages: [],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-03'),
        isPublished: false
      },
      {
        id: '2',
        name: 'Task Manager',
        description: 'Productivity app for managing tasks and projects',
        pages: [],
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-10'),
        isPublished: true,
        publishedUrl: 'https://my-task-manager.vercel.app'
      }
    ];

    res.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// POST /api/projects - Create new project
router.post('/', (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const newProject = {
      id: Date.now().toString(),
      name,
      description: description || '',
      pages: [{
        id: '1',
        name: 'Home',
        components: [],
        styles: {}
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: false
    };

    res.status(201).json({ project: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
});

// GET /api/projects/:id - Get specific project
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock project data
    const project = {
      id,
      name: 'Sample Project',
      description: 'A sample project for testing',
      pages: [{
        id: '1',
        name: 'Home',
        components: [],
        styles: {}
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublished: false
    };

    res.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Mock update
    const updatedProject = {
      id,
      ...updates,
      updatedAt: new Date()
    };

    res.json({ project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Mock deletion
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
