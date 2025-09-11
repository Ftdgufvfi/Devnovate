# Git Setup Script for AI-Powered Website Builder
Write-Host "🚀 Setting up Git repository for AI-Powered Website Builder..." -ForegroundColor Green

# Check if git is installed
try {
    git --version | Out-Null
    Write-Host "✅ Git is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first:" -ForegroundColor Red
    Write-Host "   Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "   Or use winget: winget install --id Git.Git -e --source winget" -ForegroundColor Yellow
    exit 1
}

# Set current directory
Set-Location $PSScriptRoot

# Initialize git repository
Write-Host "📁 Initializing git repository..." -ForegroundColor Blue
git init

# Add all files
Write-Host "📄 Adding files to git..." -ForegroundColor Blue
git add .

# Make initial commit
Write-Host "💾 Creating initial commit..." -ForegroundColor Blue
git commit -m "Initial commit: AI-Powered Full-Stack Website Builder

Features implemented:
✅ Frontend: React drag-and-drop canvas with component library
✅ Backend: Node.js/Express API with Azure OpenAI integration  
✅ AI conversation system with canvas state preservation
✅ ReactSandbox with real-time JSX compilation
✅ Auto-apply functionality for style changes and error fixes
✅ Canvas-based position and style preservation
✅ Thread-based conversation management
✅ Session persistence and error handling

Tech Stack:
- Frontend: React 18 + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- AI: Azure OpenAI API (GPT-4)
- Real-time: Babel browser compilation"

Write-Host ""
Write-Host "✅ Git repository initialized and initial commit created!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Create a new repository on GitHub" -ForegroundColor Yellow
Write-Host "2. Add remote origin:" -ForegroundColor Yellow
Write-Host "   git remote add origin https://github.com/yourusername/your-repo.git" -ForegroundColor White
Write-Host "3. Push to GitHub:" -ForegroundColor Yellow
Write-Host "   git branch -M main" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Ready to push to GitHub!" -ForegroundColor Green
