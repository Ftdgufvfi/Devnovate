# AI-Powered Full-Stack Website Builder

A comprehensive platform that enables non-technical users to create and deploy full-stack web applications using intuitive drag-and-drop tools integrated with AI-assisted code generation.

## 🚀 Features Implemented

### ✅ Frontend Design
- **Visual Canvas**: Drag-and-drop interface for designing web pages
- **Component Library**: Pre-built UI components (buttons, text, images, cards)
- **Real-time Preview**: ReactSandbox with live JSX compilation
- **Responsive Design**: Tailwind CSS with mobile-first approach

### ✅ AI Code Generation
- **Smart Code Generation**: Azure OpenAI integration generates production-ready React JSX
- **Canvas State Preservation**: AI preserves exact positions, sizes, and styles from canvas
- **Auto-Apply System**: Automatic application of style changes and error fixes
- **Thread-based Conversations**: Persistent AI conversations with context retention
- **Natural Language Processing**: Describe changes and AI implements them

### ✅ Backend Development
- **Express API Server**: RESTful API with TypeScript
- **AI Conversation Management**: Thread-based conversation system
- **Canvas State Storage**: Preserves original design specifications
- **Error Handling**: Comprehensive error management and fallback responses

### ✅ Real-time Features
- **Live Code Compilation**: Babel-powered JSX compilation in browser
- **Instant Preview**: See changes immediately without page refresh
- **Session Persistence**: Conversation and code state preserved across sessions
- **Hot Reload**: Development server with file watching

## 🏗️ Project Structure

```
Hack_devnovate/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.tsx       # Main drag-and-drop canvas
│   │   │   ├── ReactSandbox.tsx # Live code compilation & AI chat
│   │   │   ├── ComponentPalette.tsx # Draggable components
│   │   │   ├── PropertiesPanel.tsx  # Component property editor
│   │   │   └── RenderableComponent.tsx # Rendered components
│   │   ├── services/
│   │   │   └── aiService.ts     # AI API communication
│   │   └── types/
│   │       └── index.ts         # TypeScript definitions
│   └── public/
├── backend/                     # Node.js/Express backend
│   ├── src/
│   │   ├── routes/
│   │   │   └── ai.ts           # AI conversation endpoints
│   │   └── index.ts            # Express server setup
│   └── .env                    # Environment configuration
└── .github/
    └── copilot-instructions.md # Development guidelines
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript  
- **AI Integration**: Azure OpenAI API (GPT-4)
- **Styling**: Tailwind CSS
- **Code Compilation**: Babel (browser-based JSX compilation)
- **Development**: tsx, hot reload, file watching

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Azure OpenAI API key (for AI features)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Hack_devnovate
   ```

2. **Install dependencies:**
   ```bash
   # Install frontend dependencies
   cd frontend && npm install

   # Install backend dependencies  
   cd ../backend && npm install
   ```

3. **Set up environment variables:**
   ```bash
   # In backend/.env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=./database.sqlite
   JWT_SECRET=your-super-secret-jwt-key
   AZURE_OPENAI_API_KEY=your_azure_openai_api_key
   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```

4. **Start development servers:**
   ```bash
   # Terminal 1: Start backend
   cd backend && npm run dev

   # Terminal 2: Start frontend  
   cd frontend && npm start
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 🎯 Usage

1. **Design Your Layout**: 
   - Drag components from the palette to the canvas
   - Position and resize components visually
   - Edit properties in the properties panel

2. **Generate Code with AI**:
   - Click "Start AI Conversation" to generate initial React code
   - Ask AI to modify styling: "Change button color to blue"
   - Request layout changes: "Make the text bigger"
   - AI preserves exact positions and canvas design

3. **Live Preview**:
   - See your design compiled in real-time
   - Edit generated code directly if needed
   - Auto-apply for style changes and error fixes

4. **Conversation System**:
   - Persistent AI conversations across page reloads
   - Context-aware responses based on canvas state
   - Thread-based conversation management

## 🎨 Key Features Implemented

### Canvas-Based AI Preservation
- AI preserves **exact positions** from drag-and-drop design
- Maintains **original sizes** and styling from canvas
- Uses canvas state as source of truth, not current code

### Auto-Apply Intelligence  
- **Style Changes**: Auto-applied (color, font, border, etc.)
- **Error Fixes**: Auto-applied (compilation/runtime errors)
- **Structural Changes**: Preview with manual confirmation

### Real-time Compilation
- Browser-based Babel compilation
- Live JSX rendering without page refresh
- Error boundaries and debugging support

## 🔧 Development

### Adding New Components
1. Create component in `frontend/src/components/`
2. Add to component registry
3. Update drag-and-drop palette

### Adding API Endpoints
1. Define route in `backend/src/routes/`
2. Add corresponding service logic
3. Update API documentation

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Component Guide](./docs/components.md)
- [Deployment Guide](./docs/deployment.md)
- [Contributing](./docs/contributing.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎉 Acknowledgments

- OpenAI for AI capabilities
- React community for excellent tools
- All contributors who make this project possible
