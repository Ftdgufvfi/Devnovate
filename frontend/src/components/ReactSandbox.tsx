import React, { useState, useEffect, useRef } from 'react';
import { X, Play, AlertTriangle, CheckCircle, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { Component } from '../types';
import { aiService } from '../services/aiService';

// Babel standalone - we'll load it dynamically
declare global {
  interface Window {
    Babel: {
      transform: (code: string, options: any) => { code: string };
    };
    React: any;
    useState: any;
    useEffect: any;
  }
}

interface ReactSandboxProps {
  isOpen: boolean;
  onClose: () => void;
  components: Component[];
  jsxCode: string;
  onCodeUpdate?: (newCode: string) => void; // Callback to update the code
}

// Error Boundary Component for Sandbox
class SandboxErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-medium">Runtime Error</h3>
          </div>
          <p className="mt-2 text-sm text-red-600">
            {this.state.error?.message || 'An error occurred while rendering the component'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

const ReactSandbox: React.FC<ReactSandboxProps> = ({
  isOpen,
  onClose,
  components,
  jsxCode,
  onCodeUpdate
}) => {
  const [compiledComponent, setCompiledComponent] = useState<React.ComponentType | null>(null);
  const [compilationError, setCompilationError] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [currentCode, setCurrentCode] = useState(jsxCode);
  const [previousCode, setPreviousCode] = useState(''); // Start empty to track first change
  const [isCodeEditable, setIsCodeEditable] = useState(true); // Default to edit mode
  const [hasCodeChanged, setHasCodeChanged] = useState(false); // Track if code has been modified
  const [conversationId, setConversationId] = useState<string | null>(() => {
    // Initialize from session storage to persist across the session
    return sessionStorage.getItem('ai-conversation-id') || null;
  }); // This is actually a threadId
  const [conversationHistory, setConversationHistory] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    type?: 'conversation' | 'code_update' | 'error_report';
    code?: string;
    explanation?: string;
    changes?: string[];
    errors?: {
      compilation?: string;
      runtime?: string;
    };
  }>>(() => {
    // Initialize conversation history from session storage
    try {
      const savedHistory = sessionStorage.getItem('ai-conversation-history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        // Convert timestamp strings back to Date objects
        return parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Failed to load conversation history from session storage:', error);
    }
    return [];
  });
  const [showSessionRestored, setShowSessionRestored] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    explanation: string;
    enhancedCode: string;
    changes: string[];
  } | null>(null);
  const [showChangePreview, setShowChangePreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Compile JSX to React component
  const compileJSX = async (code: string) => {
    setIsCompiling(true);
    setCompilationError(null);
    setRuntimeError(null);

    try {
      // Load Babel if not already loaded
      if (!window.Babel) {
        console.log('Loading Babel standalone...');
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@babel/standalone/babel.min.js';
        script.async = true;
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = () => {
            console.log('Babel loaded successfully');
            resolve(true);
          };
          script.onerror = (error) => {
            console.error('Failed to load Babel:', error);
            reject(new Error('Failed to load Babel compiler'));
          };
          
          // Timeout after 10 seconds
          setTimeout(() => {
            reject(new Error('Babel loading timeout'));
          }, 10000);
        });
      }

      if (!window.Babel) {
        throw new Error('Babel compiler not available');
      }

      console.log('Compiling JSX code...');
      console.log('Input code:', code);

      // Make React and hooks available globally for the compiled code
      (window as any).React = React;
      (window as any).useState = useState;
      (window as any).useEffect = useEffect;

      // Wrap the JSX in a proper React component
      const wrappedCode = `
        const { React, useState, useEffect } = window;
        
        const GeneratedComponent = () => {
          return (
            <div className="sandbox-container" style={{ 
              position: 'relative', 
              width: '100%', 
              height: '100%',
              minHeight: '400px',
              backgroundColor: '#f9fafb',
              padding: '20px'
            }}>
              ${code}
            </div>
          );
        };
        
        // Return the component
        GeneratedComponent;
      `;

      // Transform JSX to JavaScript using Babel
      console.log('Transforming with Babel...');
      const result = window.Babel.transform(wrappedCode, {
        presets: [
          ['react', { 
            runtime: 'classic',
            pragma: 'React.createElement'
          }]
        ],
        plugins: [
          ['transform-react-jsx', { pragma: 'React.createElement' }]
        ],
        filename: 'generated-component.jsx'
      });

      console.log('Babel transform result:', result);

      if (!result.code) {
        throw new Error('Compilation failed: No code generated by Babel');
      }

      console.log('Compiled code:', result.code);

      // Create a safe function to evaluate the compiled code
      // eslint-disable-next-line no-new-func
      const createComponent = new Function('React', 'useState', 'useEffect', `
        try {
          ${result.code}
          return GeneratedComponent;
        } catch (error) {
          throw new Error('Runtime compilation error: ' + error.message);
        }
      `);

      // Execute and get the component
      console.log('Creating and executing component...');
      const Component = createComponent(React, useState, useEffect);
      console.log('Component created successfully:', Component);
      setCompiledComponent(() => Component);

    } catch (error) {
      console.error('Compilation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown compilation error';
      console.error('Error details:', errorMessage);
      handleCompilationError(errorMessage);
      setCompiledComponent(null);
    } finally {
      setIsCompiling(false);
    }
  };

  // Alternative: Iframe-based sandbox for safer execution
  const renderInIframe = (code: string) => {
    if (!iframeRef.current) return;

    const iframeDoc = iframeRef.current.contentDocument;
    if (!iframeDoc) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>React Sandbox</title>
          <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background: #f9fafb;
            }
            .error { 
              background: #fef2f2; 
              border: 1px solid #fecaca; 
              color: #dc2626; 
              padding: 16px; 
              border-radius: 8px;
              margin: 20px 0;
            }
            .sandbox-container {
              background: white;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            try {
              const { useState, useEffect } = React;
              
              const GeneratedComponent = () => {
                return (
                  <div className="sandbox-container">
                    ${code}
                  </div>
                );
              };

              ReactDOM.render(<GeneratedComponent />, document.getElementById('root'));
            } catch (error) {
              document.getElementById('root').innerHTML = 
                '<div class="error"><strong>Error:</strong> ' + error.message + '</div>';
            }
          </script>
        </body>
      </html>
    `;

    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
  };

  // Check for existing session on mount
  useEffect(() => {
    const savedConversationId = sessionStorage.getItem('ai-conversation-id');
    const savedHistory = sessionStorage.getItem('ai-conversation-history');
    
    if (savedConversationId && savedHistory && conversationHistory.length > 0) {
      console.log('Found existing AI session, restoring conversation:', savedConversationId);
      setShowSessionRestored(true);
      // Hide the notification after 3 seconds
      setTimeout(() => setShowSessionRestored(false), 3000);
    }
  }, []); // Run only on mount

  // Synchronize currentCode with jsxCode prop only on initial load
  // Don't overwrite AI-generated or user-edited code
  useEffect(() => {
    // Only sync if this is the initial load (currentCode matches the initial jsxCode)
    // or if there's no active conversation (no AI code to preserve)
    if (!conversationId && currentCode === jsxCode) {
      setCurrentCode(jsxCode);
    }
  }, [jsxCode, conversationId, currentCode]);

  // Compile when the component opens and currentCode changes
  useEffect(() => {
    if (isOpen && currentCode) {
      compileJSX(currentCode);
    }
  }, [isOpen, currentCode]);

  // Debug: Log when conversationId (threadId) changes and persist to session storage
  useEffect(() => {
    console.log('ReactSandbox threadId changed:', conversationId);
    if (conversationId) {
      console.log('Thread is active with ID:', conversationId);
      // Persist conversation ID to session storage
      sessionStorage.setItem('ai-conversation-id', conversationId);
    } else {
      console.log('No active thread');
      // Clear from session storage when conversation ends
      sessionStorage.removeItem('ai-conversation-id');
    }
  }, [conversationId]);

  // Debug: Log when currentCode changes
  useEffect(() => {
    console.log('ReactSandbox currentCode changed:', currentCode);
  }, [currentCode]);

  // Persist conversation history to session storage
  useEffect(() => {
    if (conversationHistory.length > 0) {
      try {
        sessionStorage.setItem('ai-conversation-history', JSON.stringify(conversationHistory));
        console.log('Saved conversation history to session storage, messages count:', conversationHistory.length);
      } catch (error) {
        console.warn('Failed to save conversation history to session storage:', error);
      }
    }
  }, [conversationHistory]);

  // Handle runtime errors
  const handleRuntimeError = (error: Error) => {
    setRuntimeError(error.message);
    
    // Auto-report error to AI if conversation is active
    if (conversationId) {
      const errorMessage = {
        role: 'assistant' as const,
        content: `❌ Runtime Error Detected: ${error.message}`,
        timestamp: new Date(),
        type: 'error_report' as const,
        errors: {
          runtime: error.message
        }
      };
      setConversationHistory(prev => [...prev, errorMessage]);
    }
  };

  // Track compilation errors and report to AI
  const handleCompilationError = (errorMessage: string) => {
    setCompilationError(errorMessage);
    
    // Auto-report error to AI if conversation is active
    if (conversationId) {
      const errorReport = {
        role: 'assistant' as const,
        content: `⚠️ Compilation Error Detected: ${errorMessage}`,
        timestamp: new Date(),
        type: 'error_report' as const,
        errors: {
          compilation: errorMessage
        }
      };
      setConversationHistory(prev => [...prev, errorReport]);
    }
  };

  // Start AI Conversation
  const startConversation = async () => {
    if (conversationId) {
      // Conversation already started, just show panel
      setShowAIPanel(true);
      return;
    }

    setIsAIGenerating(true);
    try {
      const canvasState = {
        components: components,
        pageTitle: 'AI-Generated React Component',
        theme: 'modern'
      };

      // Check for existing conversation ID from session storage to potentially restore
      const savedConversationId = sessionStorage.getItem('ai-conversation-id');
      const existingConversationId = savedConversationId && savedConversationId !== 'null' ? savedConversationId : undefined;

      console.log('Starting conversation with existing ID (if any):', existingConversationId);
      const response = await aiService.startConversation(canvasState, 'react', existingConversationId);
      
      if (response.success) {
        setConversationId(response.threadId || response.conversationId); // Handle both threadId and legacy conversationId
        
        if (response.restored) {
          console.log('Session restored successfully with existing code');
          // For restored sessions, we keep the existing code and conversation history
          // Don't overwrite current code as it might have user edits
        } else {
          console.log('New conversation started, setting initial code');
          // Save current code as previous before setting new code
          setPreviousCode(currentCode);
          setHasCodeChanged(true);
          console.log('Setting initial code from AI conversation with threadId:', response.threadId || response.conversationId); // Debug logging
          setCurrentCode(response.code);
          // Note: compileJSX will be called automatically by useEffect when currentCode changes
          
          // Add initial message to conversation history
          setConversationHistory([{
            role: 'assistant',
            content: 'I\'ve generated a React component based on your canvas design. You can now edit the code manually or ask me questions about it.',
            timestamp: new Date(),
            type: 'code_update',
            code: response.code
          }]);

          if (onCodeUpdate) {
            onCodeUpdate(response.code);
          }
        }
        
        setShowAIPanel(true);
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to start AI conversation. Please check if backend is running on http://localhost:5000');
    } finally {
      setIsAIGenerating(false);
    }
  };

  // Continue AI Conversation
  const continueConversation = async () => {
    if (!conversationId || !customPrompt.trim()) {
      console.log('Cannot continue conversation - missing data:', { threadId: conversationId, prompt: customPrompt.trim() });
      return;
    }
    
    console.log('Continuing conversation with threadId:', conversationId, 'Prompt:', customPrompt);
    setIsAIGenerating(true);
    try {
      // Prepare enhanced message with error context
      let enhancedMessage = customPrompt;
      
      // Expand simple "Fix errors" to detailed prompt for AI
      if (customPrompt.toLowerCase().trim() === "fix errors") {
        enhancedMessage = "IMPORTANT: Only fix the compilation and runtime errors in the React code. Do not make major changes to styling, structure, or functionality. Keep the existing design and behavior intact. Only modify what's necessary to resolve the errors and make the code work properly.";
      }
      
      // Include current errors in the context
      const currentErrors = [];
      if (compilationError) {
        currentErrors.push(`Compilation Error: ${compilationError}`);
      }
      if (runtimeError) {
        currentErrors.push(`Runtime Error: ${runtimeError}`);
      }
      
      if (currentErrors.length > 0) {
        enhancedMessage += `\n\nCurrent Issues:\n${currentErrors.join('\n')}`;
      }

      // Add user message to history (show the simple version to user)
      const userMessage = {
        role: 'user' as const,
        content: customPrompt,
        timestamp: new Date(),
        errors: currentErrors.length > 0 ? {
          compilation: compilationError || undefined,
          runtime: runtimeError || undefined
        } : undefined
      };
      setConversationHistory(prev => [...prev, userMessage]);

      console.log('Making API call to continue conversation...'); // Debug logging
      console.log('Request payload:', { conversationId, enhancedMessage, currentCode, errors: currentErrors.length > 0 ? { compilation: compilationError || undefined, runtime: runtimeError || undefined } : undefined }); // Debug logging

      // Create canvas state for preservation
      const canvasState = {
        components: components,
        pageTitle: 'AI-Generated React Component',
        theme: 'modern'
      };

      const response = await aiService.continueConversation(
        conversationId, 
        enhancedMessage, 
        currentCode,
        currentErrors.length > 0 ? {
          compilation: compilationError || undefined,
          runtime: runtimeError || undefined
        } : undefined,
        canvasState // Pass canvas state for preservation
      );
      
      console.log('AI Service Response:', response); // Debug logging
      console.log('Response success:', response.success, 'Response type:', response.type); // Debug logging
      
      if (response.success) {
        if (response.type === 'code_update') {
          console.log('Processing code update response...'); // Debug logging
          console.log('Code update response received:', response.code); // Debug logging
          console.log('Auto-apply flag:', response.autoApply, 'Change type:', response.changeType); // Debug logging
          
          // AI provided updated code
          const currentErrors = [];
          if (compilationError) {
            currentErrors.push(`Compilation Error: ${compilationError}`);
          }
          if (runtimeError) {
            currentErrors.push(`Runtime Error: ${runtimeError}`);
          }
          
          // Auto-apply code if:
          // 1. There were errors (existing behavior)
          // 2. It's a simple style change (new behavior)
          const shouldAutoApply = currentErrors.length > 0 || response.autoApply;
          
          if (shouldAutoApply) {
            const reasonForAutoApply = currentErrors.length > 0 ? 'errors' : 'style change';
            console.log(`Auto-applying ${reasonForAutoApply}:`, currentErrors.length > 0 ? currentErrors : 'simple style update'); // Debug logging
            
            // Save current code as previous before auto-applying
            setPreviousCode(currentCode);
            setHasCodeChanged(true);
            
            // Auto-apply the code
            console.log('Setting new code from AI:', response.code); // Debug logging
            setCurrentCode(response.code);
            // Note: compileJSX will be called automatically by useEffect when currentCode changes
            if (onCodeUpdate) {
              onCodeUpdate(response.code);
            }
            
            // Enable edit mode so user can see the applied changes
            setIsCodeEditable(true);
            
            // Add to conversation history with auto-applied indicator
            const autoApplyMessage = currentErrors.length > 0 
              ? `✅ Auto-applied fix: ${response.explanation}`
              : `✅ Auto-applied style change: ${response.explanation}`;
              
            setConversationHistory(prev => [...prev, {
              role: 'assistant',
              content: autoApplyMessage,
              timestamp: new Date(),
              type: 'code_update',
              code: response.code,
              explanation: response.explanation,
              changes: response.changes
            }]);
            
            // Clear any pending AI responses
            setAiResponse(null);
            setShowChangePreview(false);
          } else {
            // No errors, show preview for user confirmation
            setAiResponse({
              explanation: response.explanation,
              enhancedCode: response.code,
              changes: response.changes || []
            });
            setShowChangePreview(true);
            
            // Add to conversation history
            setConversationHistory(prev => [...prev, {
              role: 'assistant',
              content: response.explanation,
              timestamp: new Date(),
              type: 'code_update',
              code: response.code,
              explanation: response.explanation,
              changes: response.changes
            }]);
          }
        } else {
          // Conversational response only
          console.log('Processing conversational response:', response.response); // Debug logging
          setConversationHistory(prev => [...prev, {
            role: 'assistant',
            content: response.response,
            timestamp: new Date(),
            type: 'conversation'
          }]);
        }
      } else {
        console.error('AI response was not successful:', response); // Debug logging
      }
      
      setCustomPrompt('');
    } catch (error) {
      console.error('Failed to continue conversation:', error);
      console.log('Error details:', error); // More detailed error logging
      
      // Add error message to conversation history
      setConversationHistory(prev => [...prev, {
        role: 'assistant' as const,
        content: `❌ Error: Failed to get AI response. Please check if the backend server is running and try again.`,
        timestamp: new Date(),
        type: 'error_report' as const
      }]);
      
      alert('Failed to continue conversation. Please check if the backend server is running on http://localhost:5000');
    } finally {
      setIsAIGenerating(false);
    }
  };

  // Handle manual code changes
  const handleCodeChange = (newCode: string) => {
    // Save current code as previous before making changes (only if different)
    if (newCode !== currentCode) {
      setPreviousCode(currentCode);
      setHasCodeChanged(true);
    }
    
    setCurrentCode(newCode);
    // Note: compileJSX will be called automatically by useEffect when currentCode changes
    if (onCodeUpdate) {
      onCodeUpdate(newCode);
    }
  };

  // Reset to previous code state
  const handleResetChanges = () => {
    if (previousCode && previousCode !== currentCode) {
      const codeToRestore = previousCode;
      setCurrentCode(codeToRestore);
      // Note: compileJSX will be called automatically by useEffect when currentCode changes
      if (onCodeUpdate) {
        onCodeUpdate(codeToRestore);
      }
      // Update the previous code to the current one before reset
      setPreviousCode(currentCode);
    }
  };

  const handleKeepChanges = () => {
    if (aiResponse) {
      // Save current code as previous before applying changes
      setPreviousCode(currentCode);
      setHasCodeChanged(true);
      setCurrentCode(aiResponse.enhancedCode);
      compileJSX(aiResponse.enhancedCode);
      if (onCodeUpdate) {
        onCodeUpdate(aiResponse.enhancedCode);
      }
    }
    setAiResponse(null);
    setShowChangePreview(false);
    setShowAIPanel(false);
  };

  const handleDiscardChanges = () => {
    // Keep the current code unchanged
    setAiResponse(null);
    setShowChangePreview(false);
    setShowAIPanel(false);
  };

  // Update current code when jsxCode prop changes (only for initial load)
  // Don't overwrite AI-generated or user-edited code
  useEffect(() => {
    // Only sync jsxCode if there's no active conversation and we haven't made changes
    if (!conversationId && !hasCodeChanged && currentCode === jsxCode) {
      setCurrentCode(jsxCode);
      compileJSX(jsxCode); // Compile the code when it changes
      // Only set previous code if it's empty (initial load)
      if (previousCode === '') {
        setPreviousCode(jsxCode);
      }
    }
  }, [jsxCode, conversationId, hasCodeChanged, currentCode, previousCode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[95vh] flex flex-col">
        {/* Session Restored Notification */}
        {showSessionRestored && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mx-6 mt-3 rounded">
            <div className="flex items-center">
              <div className="flex">
                <CheckCircle className="h-4 w-4 text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  AI conversation session restored with {conversationHistory.length} messages
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Play className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">React Sandbox</h2>
            <div className="flex items-center space-x-2">
              {isCompiling && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm">Compiling...</span>
                </div>
              )}
              {!isCompiling && !compilationError && !runtimeError && compiledComponent && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Ready</span>
                </div>
              )}
              {(compilationError || runtimeError) && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Error</span>
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Live Preview */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Live React Preview</h3>
              <p className="text-xs text-gray-500 mt-1">
                Real-time compiled React components with hooks and state
              </p>
            </div>
            
            <div className="flex-1 overflow-auto bg-gray-50 p-6">
              {/* Error Display */}
              {compilationError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    <h4 className="font-medium">Compilation Error</h4>
                  </div>
                  <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap font-mono">
                    {compilationError}
                  </pre>
                </div>
              )}

              {runtimeError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    <h4 className="font-medium">Runtime Error</h4>
                  </div>
                  <pre className="mt-2 text-sm text-red-600 whitespace-pre-wrap font-mono">
                    {runtimeError}
                  </pre>
                </div>
              )}

              {/* Compiled Component Rendering */}
              {!compilationError && !isCompiling && compiledComponent && (
                <div className="bg-white rounded-lg border-2 border-dashed border-gray-200 min-h-[500px] relative">
                  <div className="absolute top-2 left-2 text-xs text-gray-500 bg-white px-2 py-1 rounded z-10">
                    React Component (Compiled & Running)
                  </div>
                  
                  <div className="p-4">
                    <SandboxErrorBoundary onError={handleRuntimeError}>
                      {React.createElement(compiledComponent)}
                    </SandboxErrorBoundary>
                  </div>
                </div>
              )}

              {/* Iframe Alternative (for safer execution) */}
              <div className="hidden">
                <iframe
                  ref={iframeRef}
                  className="w-full h-96 border border-gray-200 rounded-lg"
                  title="React Sandbox Iframe"
                  sandbox="allow-scripts"
                />
              </div>
            </div>
          </div>

          {/* Code View */}
          <div className="w-1/2 border-l border-gray-200 flex flex-col relative">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Generated React JSX</h3>
              <p className="text-xs text-gray-500 mt-1">
                This code is compiled to JavaScript and executed as React components
              </p>
            </div>
            
            {/* Code Editor and Preview */}
            <div className="flex-1 overflow-auto">
              <div className="flex items-center justify-between p-3 bg-gray-100 border-b">
                <span className="text-sm font-medium text-gray-700">React Code</span>
                <div className="flex items-center space-x-2">
                  {/* Debug info - remove after testing */}
                  <span className="text-xs text-gray-500">
                    Editable:{isCodeEditable ? 'Y' : 'N'} | Changed:{hasCodeChanged ? 'Y' : 'N'}
                  </span>
                  
                  {hasCodeChanged && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded border">
                      ✅ Code Updated
                    </span>
                  )}
                  
                  {hasCodeChanged && (
                    <button
                      onClick={handleResetChanges}
                      className="text-xs px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center space-x-1"
                      title="Reset to previous state"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsCodeEditable(!isCodeEditable)}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {isCodeEditable ? 'View Only' : 'Edit Code'}
                  </button>
                </div>
              </div>
              
              {isCodeEditable ? (
                <textarea
                  value={currentCode}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="w-full h-full p-4 text-xs font-mono bg-gray-900 text-green-400 border-none outline-none resize-none"
                  style={{ minHeight: '400px' }}
                />
              ) : (
                <pre className="p-4 text-xs text-gray-800 bg-gray-900 text-green-400 h-full overflow-auto font-mono">
                  <code>{currentCode}</code>
                </pre>
              )}
            </div>

            {/* AI Conversation Panel */}
            {showAIPanel && !showChangePreview && (
              <div className="absolute top-16 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-96 h-96 flex flex-col">
                {/* Header with tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex items-center justify-between p-3 border-b border-gray-100">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
                      AI Assistant
                      {conversationId && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-normal flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                          Session Active
                        </span>
                      )}
                    </h3>
                    <button
                      onClick={() => setShowAIPanel(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Tab Navigation */}
                  <div className="flex border-b border-gray-200">
                    <div className="flex-1 px-3 py-2 text-xs font-medium text-purple-600 bg-purple-50 border-b-2 border-purple-600">
                      💬 Chat
                    </div>
                    {(compilationError || runtimeError) && (
                      <div className="flex-1 px-3 py-2 text-xs font-medium text-red-600 bg-red-50 border-b-2 border-red-200 flex items-center">
                        ⚠️ Errors
                        <span className="ml-1 bg-red-600 text-white rounded-full text-xs px-1">
                          {(compilationError ? 1 : 0) + (runtimeError ? 1 : 0)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Status Bar */}
                  <div className="px-3 py-1 bg-gray-50 border-b border-gray-200 text-xs text-gray-600">
                    {conversationId ? (
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Connected • Context preserved
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                        Ready to start conversation
                      </span>
                    )}
                  </div>

                  {/* Chat History - Scrollable */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {conversationHistory.length === 0 && !conversationId && (
                      <div className="text-center text-gray-500 text-xs py-8">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-300" />
                        <p>Start a conversation to generate React code from your canvas</p>
                      </div>
                    )}
                    
                    {conversationHistory.map((message, index) => (
                      <div key={index} className={`p-2 rounded text-xs ${
                        message.role === 'user' 
                          ? 'bg-blue-50 border-l-2 border-blue-500 ml-4' 
                          : message.type === 'error_report'
                          ? 'bg-red-50 border-l-2 border-red-500'
                          : 'bg-gray-50 border-l-2 border-purple-500 mr-4'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-xs">
                            {message.role === 'user' ? '👤 You' : '🤖 AI'}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-gray-800 text-xs leading-relaxed">
                          {message.content.length > 120 ? `${message.content.substring(0, 120)}...` : message.content}
                        </div>
                        {message.type === 'code_update' && (
                          <div className="mt-1 text-xs text-green-600 font-medium">✅ Code Updated</div>
                        )}
                        {message.type === 'error_report' && (
                          <div className="mt-1 text-xs text-red-600 font-medium">🚨 Error Detected</div>
                        )}
                      </div>
                    ))}

                    {/* Error Summary Panel */}
                    {(compilationError || runtimeError) && conversationId && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                        <div className="flex items-center text-yellow-800 mb-1">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          <span className="text-xs font-medium">Active Issues</span>
                        </div>
                        {compilationError && (
                          <div className="text-xs text-yellow-700 mb-1 font-mono bg-yellow-100 p-1 rounded">
                            ⚠️ {compilationError.substring(0, 60)}...
                          </div>
                        )}
                        {runtimeError && (
                          <div className="text-xs text-yellow-700 mb-1 font-mono bg-yellow-100 p-1 rounded">
                            🔴 {runtimeError.substring(0, 60)}...
                          </div>
                        )}
                        <button
                          onClick={() => {
                            setCustomPrompt("Fix errors");
                          }}
                          className="text-xs px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 mt-1"
                        >
                          🔧 Auto-Fix Errors
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Input Section - Fixed at bottom */}
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="space-y-2">
                      <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder={!!conversationId 
                          ? "Ask about code, request changes, or describe what you want..."
                          : "Click 'Start' to generate React code from your canvas..."
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none"
                        rows={2}
                      />
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={conversationId ? continueConversation : startConversation}
                          disabled={isAIGenerating || (!!conversationId && !customPrompt.trim())}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isAIGenerating ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              {!!conversationId ? (
                                <>
                                  <span>💬</span>
                                  <span>Send</span>
                                </>
                              ) : (
                                <>
                                  <span>🚀</span>
                                  <span>Start</span>
                                </>
                              )}
                            </>
                          )}
                        </button>
                        
                        {conversationId && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                // Force save current session
                                if (conversationId) {
                                  sessionStorage.setItem('ai-conversation-id', conversationId);
                                }
                                if (conversationHistory.length > 0) {
                                  sessionStorage.setItem('ai-conversation-history', JSON.stringify(conversationHistory));
                                }
                                // Show temporary feedback
                                const button = document.activeElement as HTMLButtonElement;
                                const originalText = button.textContent;
                                button.textContent = '✅ Saved';
                                setTimeout(() => {
                                  if (button) button.textContent = originalText;
                                }, 1000);
                              }}
                              className="px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                            >
                              💾 Save Session
                            </button>
                            <button
                              onClick={() => {
                                setConversationId(null);
                                setConversationHistory([]);
                                setCustomPrompt('');
                                // Clear session storage
                                sessionStorage.removeItem('ai-conversation-id');
                                sessionStorage.removeItem('ai-conversation-history');
                                console.log('Reset conversation and cleared session storage');
                              }}
                              className="px-3 py-1.5 bg-gray-400 text-white rounded text-xs hover:bg-gray-500 transition-colors"
                            >
                              🔄 Reset Session
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500 text-center space-y-1">
                        <div>
                          {!!conversationId 
                            ? 'AI thread active - conversation persisted in session'
                            : 'Generate React code and start chatting'
                          }
                        </div>
                        {conversationId && (
                          <div className="space-y-1">
                            <div className="text-xs text-gray-400 font-mono">
                              Thread: {conversationId.slice(-8)}
                            </div>
                            <div className="text-xs text-blue-600 flex items-center justify-center">
                              💾 Session: {conversationHistory.length} messages
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Response and Change Preview Panel */}
            {showChangePreview && aiResponse && (
              <div className="absolute top-16 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 p-6 w-96 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Sparkles className="w-5 h-5 text-green-600 mr-2" />
                    AI Enhancement Results
                  </h3>
                  <button
                    onClick={handleDiscardChanges}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* AI Explanation */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">AI Assistant says:</h4>
                    <p className="text-sm text-blue-800">{aiResponse.explanation}</p>
                  </div>

                  {/* Changes Made */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Changes Made:</h4>
                    <ul className="space-y-1">
                      {aiResponse.changes.map((change, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Code Preview */}
                  <div className="bg-gray-900 rounded-lg p-3 max-h-32 overflow-y-auto">
                    <div className="text-xs text-gray-400 mb-2">Enhanced Code Preview:</div>
                    <pre className="text-xs text-green-400 font-mono">
                      {aiResponse.enhancedCode.substring(0, 200)}...
                    </pre>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-2">
                    <button
                      onClick={handleKeepChanges}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <span>✓ Keep Changes</span>
                    </button>
                    <button
                      onClick={handleDiscardChanges}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <span>✗ Discard</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {components.length} component(s) • Real React compilation with Babel
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => conversationId ? setShowAIPanel(!showAIPanel) : startConversation()}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{!!conversationId ? 'AI Chat' : 'Start AI'}</span>
            </button>
            <button 
              onClick={() => renderInIframe(jsxCode)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Render in Iframe (Safe Mode)
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close Sandbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReactSandbox;
