import React, { useState } from 'react';
import { X, Copy, Download, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import useBuilderStore from '../store/builderStore';
import ReactSandbox from './ReactSandbox';
import { aiService } from '../services/aiService';

interface CodeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CodeGeneratorModal: React.FC<CodeGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'react' | 'html' | 'css'>('react');
  const [copied, setCopied] = useState(false);
  const [showReactSandbox, setShowReactSandbox] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [aiGeneratedCode, setAiGeneratedCode] = useState<any>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const { currentPage } = useBuilderStore();

  if (!isOpen || !currentPage) return null;

  // Handle AI code generation
  const handleAIGenerate = async () => {
    setIsAIGenerating(true);
    try {
      const canvasState = {
        components: currentPage.components,
        pageTitle: 'Generated Page',
        theme: 'modern'
      };

      const response = await aiService.generateFromCanvas(canvasState, activeTab, customPrompt);
      setAiGeneratedCode(response.code);
      setUseAI(true);
    } catch (error) {
      console.error('AI generation failed:', error);
      // Keep the original code generation as fallback
      setUseAI(false);
    } finally {
      setIsAIGenerating(false);
    }
  };

  const generateComponentJSX = () => {
    const components = currentPage.components;
    
    const generateComponentStyles = (comp: any) => {
      const styles: string[] = [];
      const inlineStyles: string[] = [];
      
      // Position styles - Use percentage if available, fallback to pixels
      if (comp.position) {
        if (comp.position.xPercent !== undefined && comp.position.yPercent !== undefined) {
          inlineStyles.push(`left: '${comp.position.xPercent}%'`);
          inlineStyles.push(`top: '${comp.position.yPercent}%'`);
        } else {
          inlineStyles.push(`left: '${comp.position.x}px'`);
          inlineStyles.push(`top: '${comp.position.y}px'`);
        }
        styles.push('absolute');
      }
      
      // Custom styles from properties panel
      if (comp.style?.backgroundColor && comp.style.backgroundColor !== '#ffffff') {
        inlineStyles.push(`backgroundColor: '${comp.style.backgroundColor}'`);
      }
      if (comp.style?.margin) {
        inlineStyles.push(`margin: '${comp.style.margin}'`);
      }
      if (comp.style?.padding) {
        inlineStyles.push(`padding: '${comp.style.padding}'`);
      }
      
      const className = styles.length > 0 ? ` className="${styles.join(' ')}"` : '';
      const styleAttr = inlineStyles.length > 0 ? ` style={{ ${inlineStyles.join(', ')} }}` : '';
      
      return { className, styleAttr };
    };
    
    const componentCode = components.map(comp => {
      const { className, styleAttr } = generateComponentStyles(comp);
      
      switch (comp.type) {
        case 'Button':
          const variant = comp.props.variant || 'primary';
          const size = comp.props.size || 'medium';
          const buttonClasses = [
            'px-4 py-2 rounded-lg transition-colors font-medium',
            variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : 
            variant === 'secondary' ? 'bg-gray-600 text-white hover:bg-gray-700' :
            'border border-gray-300 text-gray-700 hover:bg-gray-50',
            size === 'small' ? 'text-sm px-3 py-1' :
            size === 'large' ? 'text-lg px-6 py-3' : 'text-base px-4 py-2'
          ];
          
          // Add positioning class if needed
          if (className && className.includes('absolute')) {
            buttonClasses.unshift('absolute');
          }
          
          return `<button 
        className="${buttonClasses.join(' ')}"${styleAttr}
        onClick={() => alert('Button clicked!')}
      >
        ${comp.props.text || 'Button'}
      </button>`;
        
        case 'Text':
          const textSize = comp.props.size || 'medium';
          const textAlign = comp.props.align || 'left';
          const textWeight = comp.props.weight || 'normal';
          const textClasses = [
            'text-gray-900',
            textSize === 'small' ? 'text-sm' :
            textSize === 'large' ? 'text-lg' :
            textSize === 'xl' ? 'text-xl' : 'text-base',
            `text-${textAlign}`,
            textWeight === 'bold' ? 'font-bold' :
            textWeight === 'semibold' ? 'font-semibold' : 'font-normal'
          ];
          
          // Add positioning class if needed
          if (className && className.includes('absolute')) {
            textClasses.unshift('absolute');
          }
          
          return `<${comp.props.tag || 'p'} 
        className="${textClasses.join(' ')}"${styleAttr}
      >
        ${comp.props.content || 'Your text here'}
      </${comp.props.tag || 'p'}>`;
        
        case 'Image':
          const imgClasses = 'rounded-lg max-w-full h-auto';
          
          // Build inline styles for width and height
          const imgInlineStyles: string[] = [];
          if (comp.position) {
            if (comp.position.xPercent !== undefined && comp.position.yPercent !== undefined) {
              imgInlineStyles.push(`left: '${comp.position.xPercent}%'`);
              imgInlineStyles.push(`top: '${comp.position.yPercent}%'`);
            } else {
              imgInlineStyles.push(`left: '${comp.position.x}px'`);
              imgInlineStyles.push(`top: '${comp.position.y}px'`);
            }
            imgInlineStyles.push('position: "absolute"');
          }
          
          // Add width and height from component dimensions
          if (comp.width) {
            imgInlineStyles.push(`width: '${comp.width}px'`);
          }
          if (comp.height) {
            imgInlineStyles.push(`height: '${comp.height}px'`);
          }
          
          // Add other custom styles
          if (comp.style) {
            Object.entries(comp.style).forEach(([key, value]) => {
              if (key === 'backgroundColor' && value) {
                imgInlineStyles.push(`backgroundColor: '${value}'`);
              } else if (key === 'border' && value) {
                imgInlineStyles.push(`border: '${value}'`);
              } else if (key === 'borderRadius' && value) {
                imgInlineStyles.push(`borderRadius: '${value}'`);
              } else if (key === 'padding' && value) {
                imgInlineStyles.push(`padding: '${value}'`);
              } else if (key === 'margin' && value) {
                imgInlineStyles.push(`margin: '${value}'`);
              }
            });
          }
          
          const imgStyleAttr = imgInlineStyles.length > 0 ? ` style={{ ${imgInlineStyles.join(', ')} }}` : '';
          
          return `<img 
        src="${comp.props.src || 'https://via.placeholder.com/300x200'}" 
        alt="${comp.props.alt || 'Image'}"
        className="${imgClasses}"${imgStyleAttr}
      />`;
        
        case 'Card':
          // Build inline styles for Card dimensions and positioning
          const cardInlineStyles: string[] = [];
          if (comp.position) {
            if (comp.position.xPercent !== undefined && comp.position.yPercent !== undefined) {
              cardInlineStyles.push(`left: '${comp.position.xPercent}%'`);
              cardInlineStyles.push(`top: '${comp.position.yPercent}%'`);
            } else {
              cardInlineStyles.push(`left: '${comp.position.x}px'`);
              cardInlineStyles.push(`top: '${comp.position.y}px'`);
            }
            cardInlineStyles.push('position: "absolute"');
          }
          
          // Add width and height from component dimensions
          if (comp.width) {
            cardInlineStyles.push(`width: '${comp.width}px'`);
          }
          if (comp.height) {
            cardInlineStyles.push(`height: '${comp.height}px'`);
          }
          
          // Add other custom styles
          if (comp.style) {
            Object.entries(comp.style).forEach(([key, value]) => {
              if (key === 'backgroundColor' && value) {
                cardInlineStyles.push(`backgroundColor: '${value}'`);
              } else if (key === 'border' && value) {
                cardInlineStyles.push(`border: '${value}'`);
              } else if (key === 'borderRadius' && value) {
                cardInlineStyles.push(`borderRadius: '${value}'`);
              } else if (key === 'padding' && value) {
                cardInlineStyles.push(`padding: '${value}'`);
              } else if (key === 'margin' && value) {
                cardInlineStyles.push(`margin: '${value}'`);
              }
            });
          }
          
          const cardStyleAttr = cardInlineStyles.length > 0 ? ` style={{ ${cardInlineStyles.join(', ')} }}` : '';
          
          return `<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"${cardStyleAttr}>
        ${comp.props.showImage ? `<img src="${comp.props.imageSrc || 'https://via.placeholder.com/400x200'}" alt="${comp.props.imageAlt || 'Card image'}" className="w-full h-48 object-cover" />` : ''}
        <div className="p-6">
          ${comp.props.title ? `<h3 className="text-lg font-semibold text-gray-900 mb-2">${comp.props.title}</h3>` : ''}
          ${comp.props.content ? `<p className="text-gray-600">${comp.props.content}</p>` : ''}
        </div>
      </div>`;
        
        default:
          return `<div${className ? className : ''}${styleAttr}>Unknown component: ${comp.type}</div>`;
      }
    }).join('\n\n      ');

    return componentCode;
  };

  const generateReactCode = () => {
    const componentCode = generateComponentJSX();

    return `import React from 'react';

const GeneratedComponent = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      {/* Generated Components with Absolute Positioning */}
      ${componentCode}
    </div>
  );
};

export default GeneratedComponent;`;
  };

  const generateHTMLCode = () => {
    const components = currentPage.components;
    
    const generateHTMLStyles = (comp: any) => {
      const styles: string[] = [];
      
      // Position styles - Use percentage if available, fallback to pixels
      if (comp.position) {
        styles.push(`position: absolute`);
        if (comp.position.xPercent !== undefined && comp.position.yPercent !== undefined) {
          styles.push(`left: ${comp.position.xPercent}%`);
          styles.push(`top: ${comp.position.yPercent}%`);
        } else {
          styles.push(`left: ${comp.position.x}px`);
          styles.push(`top: ${comp.position.y}px`);
        }
      }
      
      // Custom styles from properties panel
      if (comp.style?.backgroundColor && comp.style.backgroundColor !== '#ffffff') {
        styles.push(`background-color: ${comp.style.backgroundColor}`);
      }
      if (comp.style?.margin) {
        styles.push(`margin: ${comp.style.margin}`);
      }
      if (comp.style?.padding) {
        styles.push(`padding: ${comp.style.padding}`);
      }
      
      return styles.length > 0 ? ` style="${styles.join('; ')}"` : '';
    };
    
    const componentCode = components.map(comp => {
      const styleAttr = generateHTMLStyles(comp);
      
      switch (comp.type) {
        case 'Button':
          const variant = comp.props.variant || 'primary';
          const size = comp.props.size || 'medium';
          const buttonClasses = [
            'px-4 py-2 rounded-lg transition-colors font-medium',
            variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : 
            variant === 'secondary' ? 'bg-gray-600 text-white hover:bg-gray-700' :
            'border border-gray-300 text-gray-700 hover:bg-gray-50',
            size === 'small' ? 'text-sm px-3 py-1' :
            size === 'large' ? 'text-lg px-6 py-3' : 'text-base px-4 py-2'
          ].join(' ');
          
          return `    <button class="${buttonClasses}"${styleAttr} onclick="alert('Button clicked!')">
      ${comp.props.text || 'Button'}
    </button>`;
        
        case 'Text':
          const textSize = comp.props.size || 'medium';
          const textAlign = comp.props.align || 'left';
          const textWeight = comp.props.weight || 'normal';
          const textClasses = [
            'text-gray-900',
            textSize === 'small' ? 'text-sm' :
            textSize === 'large' ? 'text-lg' :
            textSize === 'xl' ? 'text-xl' : 'text-base',
            `text-${textAlign}`,
            textWeight === 'bold' ? 'font-bold' :
            textWeight === 'semibold' ? 'font-semibold' : 'font-normal'
          ].join(' ');
          
          return `    <${comp.props.tag || 'p'} class="${textClasses}"${styleAttr}>${comp.props.content || 'Your text here'}</${comp.props.tag || 'p'}>`;
        
        case 'Image':
          const imgClasses = 'rounded-lg max-w-full h-auto';
          let imgStyle = styleAttr;
          if (comp.width || comp.height) {
            const extraStyles = [];
            if (comp.width) extraStyles.push(`width: ${comp.width}px`);
            if (comp.height) extraStyles.push(`height: ${comp.height}px`);
            
            if (imgStyle) {
              imgStyle = imgStyle.slice(0, -1) + '; ' + extraStyles.join('; ') + '"';
            } else {
              imgStyle = ` style="${extraStyles.join('; ')}"`;
            }
          }
          
          return `    <img src="${comp.props.src || 'https://via.placeholder.com/300x200'}" alt="${comp.props.alt || 'Image'}" class="${imgClasses}"${imgStyle}>`;
        
        case 'Card':
          let cardStyle = styleAttr;
          if (comp.width || comp.height) {
            const extraStyles = [];
            if (comp.width) extraStyles.push(`width: ${comp.width}px`);
            if (comp.height) extraStyles.push(`height: ${comp.height}px`);
            
            if (cardStyle) {
              cardStyle = cardStyle.slice(0, -1) + '; ' + extraStyles.join('; ') + '"';
            } else {
              cardStyle = ` style="${extraStyles.join('; ')}"`;
            }
          }
          
          return `    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"${cardStyle}>
      ${comp.props.showImage ? `<img src="${comp.props.imageSrc || 'https://via.placeholder.com/400x200'}" alt="${comp.props.imageAlt || 'Card image'}" class="w-full h-48 object-cover">` : ''}
      <div class="p-6">
        ${comp.props.title ? `<h3 class="text-lg font-semibold text-gray-900 mb-2">${comp.props.title}</h3>` : ''}
        ${comp.props.content ? `<p class="text-gray-600">${comp.props.content}</p>` : ''}
      </div>
    </div>`;
        
        default:
          return `    <div${styleAttr}>Unknown component: ${comp.type}</div>`;
      }
    }).join('\n\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Page</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gray-50 p-8">
  <div class="relative">
    <!-- Generated Components with Custom Styles and Positioning -->
${componentCode}
  </div>
</body>
</html>`;
  };

  const generateCSSCode = () => {
    const components = currentPage.components;
    
    // Generate component-specific CSS classes
    const componentStyles = components.map((comp, index) => {
      const className = `.component-${comp.id}`;
      const styles: string[] = [];
      
      // Position styles - Use percentage if available, fallback to pixels
      if (comp.position) {
        styles.push(`  position: absolute;`);
        if (comp.position.xPercent !== undefined && comp.position.yPercent !== undefined) {
          styles.push(`  left: ${comp.position.xPercent}%;`);
          styles.push(`  top: ${comp.position.yPercent}%;`);
        } else {
          styles.push(`  left: ${comp.position.x}px;`);
          styles.push(`  top: ${comp.position.y}px;`);
        }
      }
      
      // Custom styles from properties panel
      if (comp.style?.backgroundColor && comp.style.backgroundColor !== '#ffffff') {
        styles.push(`  background-color: ${comp.style.backgroundColor};`);
      }
      if (comp.style?.margin) {
        styles.push(`  margin: ${comp.style.margin};`);
      }
      if (comp.style?.padding) {
        styles.push(`  padding: ${comp.style.padding};`);
      }
      
      // Component-specific styles
      switch (comp.type) {
        case 'Button':
          styles.push(`  padding: 0.5rem 1rem;`);
          styles.push(`  border-radius: 0.5rem;`);
          styles.push(`  font-weight: 500;`);
          styles.push(`  cursor: pointer;`);
          styles.push(`  border: none;`);
          styles.push(`  transition: all 0.2s ease;`);
          
          const variant = comp.props.variant || 'primary';
          if (variant === 'primary') {
            styles.push(`  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);`);
            styles.push(`  color: white;`);
          }
          break;
          
        case 'Text':
          const textAlign = comp.props.align || 'left';
          const textWeight = comp.props.weight || 'normal';
          const textSize = comp.props.size || 'medium';
          
          styles.push(`  text-align: ${textAlign};`);
          styles.push(`  font-weight: ${textWeight === 'bold' ? 'bold' : textWeight === 'semibold' ? '600' : 'normal'};`);
          styles.push(`  font-size: ${textSize === 'small' ? '0.875rem' : textSize === 'large' ? '1.125rem' : textSize === 'xl' ? '1.25rem' : '1rem'};`);
          break;
          
        case 'Image':
          styles.push(`  border-radius: 0.5rem;`);
          styles.push(`  max-width: 100%;`);
          styles.push(`  height: auto;`);
          if (comp.width) styles.push(`  width: ${comp.width}px;`);
          if (comp.height) styles.push(`  height: ${comp.height}px;`);
          break;
          
        case 'Card':
          styles.push(`  background: white;`);
          styles.push(`  border-radius: 0.5rem;`);
          styles.push(`  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);`);
          styles.push(`  border: 1px solid #e5e7eb;`);
          styles.push(`  overflow: hidden;`);
          if (comp.width) styles.push(`  width: ${comp.width}px;`);
          if (comp.height) styles.push(`  height: ${comp.height}px;`);
          break;
      }
      
      if (styles.length === 0) return '';
      
      return `${className} {\n${styles.join('\n')}\n}`;
    }).filter(Boolean).join('\n\n');

    return `/* Generated CSS for Custom Styled Components */

/* Base Styles */
.container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  background: #f9fafb;
}

/* Component-Specific Styles */
${componentStyles}

/* Interactive Effects */
.component-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

.component-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .component-button {
    width: 100%;
    justify-content: center;
  }
  
  .component-text {
    font-size: clamp(1rem, 2.5vw, 1.5rem);
  }
}

/* Utility Classes */
.text-responsive {
  font-size: clamp(1rem, 2.5vw, 1.5rem);
  line-height: 1.6;
}

.shadow-custom {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}`;
  };

  const getCode = () => {
    // Use AI generated code if available, otherwise fall back to original generation
    if (useAI && aiGeneratedCode) {
      return aiGeneratedCode.main || aiGeneratedCode.raw || 'AI code generation failed';
    }

    switch (activeTab) {
      case 'react':
        return generateReactCode();
      case 'html':
        return generateHTMLCode();
      case 'css':
        return generateCSSCode();
      default:
        return '';
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handlePreview = () => {
    if (activeTab === 'html') {
      // HTML Preview - Open in new tab
      const htmlCode = generateHTMLCode();
      const blob = new Blob([htmlCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else if (activeTab === 'react') {
      // React Preview - Show live preview modal
      setShowReactSandbox(true);
    } else if (activeTab === 'css') {
      // CSS Preview - Open CodePen with CSS
      openCSSPreview();
    }
  };

  const openCSSPreview = () => {
    const cssCode = generateCSSCode();
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <style>
    ${cssCode}
  </style>
</head>
<body>
  <div class="container">
    <h1>CSS Preview</h1>
    <p>Check the browser's developer tools to see the generated CSS styles.</p>
  </div>
</body>
</html>`;
    
    const blob = new Blob([htmlTemplate], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const validateColors = () => {
    const components = currentPage.components;
    const colorIssues: string[] = [];
    
    components.forEach((comp, index) => {
      if (comp.style?.backgroundColor) {
        const color = comp.style.backgroundColor;
        if (!color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
          colorIssues.push(`Component ${index + 1} (${comp.type}): Invalid color format "${color}"`);
        }
      }
    });
    
    return colorIssues;
  };

  const handleDownload = () => {
    const code = getCode();
    const extension = activeTab === 'react' ? 'jsx' : activeTab;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-component.${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Main Code Generator Modal */}
      {isOpen && currentPage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Generated Code</h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { id: 'react', label: 'React' },
                { id: 'html', label: 'HTML' },
                { id: 'css', label: 'CSS' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setUseAI(false); // Reset AI when switching tabs
                    setAiGeneratedCode(null);
                  }}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* AI Generation Section */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">AI-Powered Code Generation</h3>
                  {useAI && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      AI Generated
                    </span>
                  )}
                </div>
                <button
                  onClick={handleAIGenerate}
                  disabled={isAIGenerating}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAIGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate with AI</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Instructions (Optional)
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g., Make it more modern, add animations, use specific colors..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows={2}
                  />
                </div>
                
                {useAI && aiGeneratedCode && (
                  <div className="text-sm text-gray-600">
                    <p>✨ Code generated using AI based on your canvas layout and {currentPage.components.length} components</p>
                  </div>
                )}
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-hidden">
              <pre className="h-full p-6 overflow-auto bg-gray-50 text-sm">
                <code className="text-gray-800 whitespace-pre-wrap">
                  {getCode()}
                </code>
              </pre>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col space-y-1">
                <div className="text-sm text-gray-600">
                  {currentPage.components.length} component(s) generated
                </div>
                {validateColors().length > 0 && (
                  <div className="text-xs text-amber-600">
                    ⚠️ {validateColors().length} color validation issue(s)
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <button 
                  onClick={handlePreview}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Preview</span>
                </button>
                
                <button 
                  onClick={handleCopy}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
                
                <button 
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* React Sandbox */}
      <ReactSandbox
        isOpen={showReactSandbox}
        onClose={() => setShowReactSandbox(false)}
        components={currentPage?.components || []}
        jsxCode={generateComponentJSX()}
        onCodeUpdate={(newCode) => {
          // Handle code updates from AI enhancement
          console.log('Code updated via AI enhancement:', newCode);
          // You can implement custom logic here if needed
          // For example, updating state or triggering re-generation
        }}
      />
    </>
  );
};

export default CodeGeneratorModal;
