import express from 'express';

const router = express.Router();

// POST /api/auth/register - Register new user
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: 'Name, email, and password are required' 
      });
    }

    // Mock user creation
    const user = {
      id: Date.now().toString(),
      name,
      email,
      createdAt: new Date()
    };

    // Mock JWT token
    const token = 'mock-jwt-token-' + Date.now();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /api/auth/login - Login user
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Mock authentication
    if (email === 'demo@example.com' && password === 'password') {
      const user = {
        id: '1',
        name: 'Demo User',
        email: 'demo@example.com'
      };

      const token = 'mock-jwt-token-' + Date.now();

      res.json({
        success: true,
        message: 'Login successful',
        user,
        token
      });
    } else {
      res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// GET /api/auth/me - Get current user
router.get('/me', (req, res) => {
  try {
    // Mock user data (in real app, extract from JWT)
    const user = {
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com'
    };

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// POST /api/auth/logout - Logout user
router.post('/logout', (req, res) => {
  try {
    // In a real app, invalidate the JWT token
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error logging out user:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

export default router;
