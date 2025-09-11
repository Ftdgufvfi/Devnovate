import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ message: 'AI routes are working!', timestamp: new Date().toISOString() });
});

// Initialize Azure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  baseURL: 'https://chevvurikarthik.cognitiveservices.azure.com/openai/deployments/gpt-4.1',
  defaultQuery: { 'api-version': '2024-12-01-preview' },
  defaultHeaders: {
    'api-key': process.env.AZURE_OPENAI_API_KEY,
  },
});

// Types for canvas state
interface ComponentPosition {
  x?: number;
  y?: number;
  xPercent?: number;
  yPercent?: number;
}

interface CanvasComponent {
  id: string;
  type: string;
  props: Record<string, any>;
  style?: Record<string, any>;
  position?: ComponentPosition;
  width?: number;
  height?: number;
  children?: CanvasComponent[];
}

interface CanvasState {
  components: CanvasComponent[];
  pageTitle?: string;
  theme?: string;
  layout?: string;
}

interface ConversationHistory {
  id: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  initialCanvasState: CanvasState;
  outputType: string;
  createdAt: Date;
}

// In-memory thread storage (simulating OpenAI threads since Azure OpenAI might not support Assistants API)
interface ThreadMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Thread {
  id: string;
  messages: ThreadMessage[];
  metadata: {
    outputType: string;
    canvasComponents: string;
    originalCanvasState?: string; // Store complete original canvas state
    createdAt: string;
  };
  createdAt: Date;
}

// In-memory thread storage (in production, use a database)
const threads = new Map<string, Thread>();

// Validation middleware
const validateCanvasRequest = [
  body('canvasState').isObject().withMessage('Canvas state is required'),
  body('outputType').isIn(['react', 'html', 'css', 'nextjs', 'vue']).withMessage('Invalid output type'),
  body('canvasState.components').isArray().withMessage('Components array is required'),
];

// POST /api/ai/generate-from-canvas - Generate code from canvas state using Azure OpenAI
router.post('/generate-from-canvas', validateCanvasRequest, async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { canvasState, outputType, customPrompt } = req.body;

    // Generate appropriate prompt based on output type
    const prompt = generatePrompt(canvasState, outputType, customPrompt);

    console.log('Generating code with Azure OpenAI for output type:', outputType);
    console.log('Canvas components count:', canvasState.components.length);

    // Call Azure OpenAI API with enhanced prompt for conversational response
    const completion = await openai.chat.completions.create({
      model: "gpt-4", // Using the deployment name
      messages: [
        {
          role: "system",
          content: getSystemPrompt(outputType) + "\n\nIMPORTANT: Your response must be in this exact JSON format:\n{\n  \"explanation\": \"A conversational explanation of what changes you made and why\",\n  \"code\": \"The complete enhanced code\",\n  \"changes\": [\"List of specific changes made\", \"Another change description\"]\n}\n\nDo not include any markdown formatting or additional text outside the JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.3, // Lower temperature for more consistent code generation
    });

    const generatedResponse = completion.choices[0]?.message?.content;

    if (!generatedResponse) {
      throw new Error('No response generated from Azure OpenAI');
    }

    console.log('Raw AI Response:', generatedResponse);

    // Parse the JSON response
    let parsedResponse;
    try {
      // Try to extract JSON from the response
      const jsonMatch = generatedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON, using fallback structure');
      // Fallback: create structured response from raw content
      parsedResponse = {
        explanation: "I've enhanced your code with modern styling and improved functionality. The changes include better responsive design, improved accessibility, and enhanced visual appeal.",
        code: generatedResponse,
        changes: [
          "Applied modern styling and animations",
          "Improved responsive design",
          "Enhanced accessibility features",
          "Added interactive hover effects"
        ]
      };
    }

    return res.json({
      success: true,
      explanation: parsedResponse.explanation,
      code: parsedResponse.code,
      changes: parsedResponse.changes,
      outputType,
      usage: completion.usage,
      message: 'Code generated successfully using Azure OpenAI',
      isAI: true,
      provider: 'Azure OpenAI'
    });

  } catch (error) {
    console.error('Error generating code with Azure OpenAI:', error);
    
    // Provide fallback mock response if Azure OpenAI fails
    const fallbackResponse = generateFallbackCode(req.body.canvasState, req.body.outputType);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate code',
      explanation: "I encountered an issue while processing your request, but I've generated a basic version of your design.",
      code: fallbackResponse.main,
      changes: [
        "Generated basic component structure",
        "Applied default styling",
        "Ensured responsive layout"
      ],
      fallback: true
    });
  }
});

// POST /api/ai/chat - AI chat assistant using Azure OpenAI
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, context, canvasState } = req.body;

    let systemPrompt = "You are an expert web development assistant specialized in helping users build websites using a drag-and-drop interface. You can analyze canvas state, suggest improvements, and provide code solutions.";
    
    let userPrompt = message;
    
    if (canvasState && canvasState.components) {
      systemPrompt += ` The user is currently working on a design with ${canvasState.components.length} components.`;
      userPrompt += `\n\nCurrent canvas state: ${JSON.stringify(canvasState, null, 2)}`;
    }
    
    if (context) {
      userPrompt += `\n\nContext: ${context}`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    // Generate contextual suggestions based on canvas state
    const suggestions = generateSuggestions(canvasState);

    return res.json({
      success: true,
      response: aiResponse || "I'm here to help with your web development needs!",
      suggestions,
      usage: completion.usage,
      provider: 'Azure OpenAI'
    });

  } catch (error) {
    console.error('Error in Azure OpenAI chat:', error);
    
    // Fallback responses when Azure OpenAI fails
    const responses = [
      "I can help you build that! Let me suggest adding a header component with navigation.",
      "That's a great idea! You can drag a form component from the palette and I'll generate the validation code.",
      "For better user experience, consider adding a loading state to your button component.",
      "I recommend using a card layout for displaying your content. It will look more professional.",
      "You can add animations to make your interface more engaging. Would you like me to generate some CSS animations?"
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return res.json({
      success: true,
      response: randomResponse,
      suggestions: generateSuggestions(req.body.canvasState),
      provider: 'Fallback'
    });
  }
});

// POST /api/ai/optimize-design - AI design optimization suggestions using Azure OpenAI
router.post('/optimize-design', async (req: Request, res: Response) => {
  try {
    const { canvasState } = req.body;

    const prompt = `Analyze this web design and provide optimization suggestions:

${JSON.stringify(canvasState, null, 2)}

Please provide:
1. Layout improvements
2. Component positioning suggestions
3. Design consistency recommendations
4. Accessibility improvements
5. Mobile responsiveness tips
6. Performance optimizations

Focus on practical, actionable advice.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a UX/UI design expert. Analyze web designs and provide detailed, actionable optimization suggestions focusing on usability, accessibility, and modern design principles."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.4,
    });

    const suggestions = completion.choices[0]?.message?.content;

    return res.json({
      success: true,
      suggestions: suggestions || "Design looks good! Consider adding more interactive elements.",
      usage: completion.usage,
      message: 'Design analysis completed',
      provider: 'Azure OpenAI'
    });

  } catch (error) {
    console.error('Error optimizing design with Azure OpenAI:', error);
    return res.status(500).json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze design' 
    });
  }
});

// POST /api/ai/conversation/start - Start a new conversation thread (thread simulation)
router.post('/conversation/start', async (req: Request, res: Response) => {
  try {
    const { canvasState, outputType = 'react', conversationId } = req.body;

    // Use provided conversation ID or generate a new unique thread ID
    const threadId = conversationId || `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check if thread already exists and we're restoring a session
    const existingThread = threads.get(threadId);
    if (existingThread && conversationId) {
      console.log('Restoring existing thread:', threadId);
      
      // Return the existing thread's last generated code
      const lastAssistantMessage = existingThread.messages
        .filter(msg => msg.role === 'assistant')
        .pop();
        
      if (lastAssistantMessage) {
        const structuredResponse = parseGeneratedCode(lastAssistantMessage.content, outputType);
        return res.json({
          success: true,
          threadId,
          conversationId: threadId,
          code: structuredResponse.main,
          rawResponse: lastAssistantMessage.content,
          outputType,
          message: 'Thread restored successfully',
          provider: 'Azure OpenAI (Thread Simulation - Restored)',
          restored: true
        });
      }
    }

    // Generate initial React code from canvas state
    const prompt = generatePrompt(canvasState, outputType, 'Generate a React component based on this canvas design. Make it clean, modern, and production-ready.');

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: getSystemPrompt(outputType) + "\n\nThis is the start of a conversation thread. Generate ONLY JSX elements for the canvas components - NO headers, page structure, or wrapper containers. PRESERVE ALL existing positions, sizes, and styles from the canvas state. Return only the specific UI elements (buttons, text, images) that match the canvas design with EXACT positioning and styling. The user will be able to modify this code and ask questions about it in follow-up messages."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.3,
    });

    const generatedCode = completion.choices[0]?.message?.content;

    if (!generatedCode) {
      throw new Error('No code generated from Azure OpenAI');
    }

    // Parse the generated code
    const structuredResponse = parseGeneratedCode(generatedCode, outputType);

    // Create thread with message history
    const thread: Thread = {
      id: threadId,
      messages: [
        {
          id: `msg_${Date.now()}_1`,
          role: 'system',
          content: getSystemPrompt(outputType),
          timestamp: new Date()
        },
        {
          id: `msg_${Date.now()}_2`,
          role: 'user',
          content: prompt,
          timestamp: new Date()
        },
        {
          id: `msg_${Date.now()}_3`,
          role: 'assistant',
          content: generatedCode,
          timestamp: new Date()
        }
      ],
      metadata: {
        outputType,
        canvasComponents: JSON.stringify(canvasState.components),
        originalCanvasState: JSON.stringify(canvasState), // Store complete canvas state
        createdAt: new Date().toISOString()
      },
      createdAt: new Date()
    };

    // Store thread
    threads.set(threadId, thread);
    console.log('Created thread:', threadId);

    return res.json({
      success: true,
      threadId,
      conversationId: threadId, // For backward compatibility with frontend
      code: structuredResponse.main,
      rawResponse: generatedCode,
      outputType,
      message: 'Thread started successfully',
      provider: 'Azure OpenAI (Thread Simulation)'
    });

  } catch (error) {
    console.error('Error starting thread with Azure OpenAI:', error);
    
    // Fallback response
    const fallbackCode = generateFallbackCode(req.body.canvasState, req.body.outputType || 'react');
    const fallbackThreadId = `thread_fallback_${Date.now()}`;

    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start thread',
      threadId: fallbackThreadId,
      code: fallbackCode.main,
      fallback: true
    });
  }
});

// POST /api/ai/conversation/continue - Continue an existing conversation using thread simulation
router.post('/conversation/continue', async (req: Request, res: Response) => {
  try {
    const { conversationId: threadId, message, currentCode, errors, canvasState } = req.body;

    if (!threadId || !message || !currentCode) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: threadId, message, currentCode'
      });
    }

    // Get thread history
    const thread = threads.get(threadId);
    
    if (!thread) {
      return res.status(404).json({
        success: false,
        error: 'Thread not found'
      });
    }

    // Extract canvas component data for preservation
    let canvasPreservationData = '';
    let canvasToUse = canvasState;
    
    // If no canvas state provided, try to get it from thread metadata
    if (!canvasToUse && thread.metadata?.originalCanvasState) {
      try {
        canvasToUse = JSON.parse(thread.metadata.originalCanvasState);
      } catch (e) {
        console.warn('Failed to parse stored canvas state from thread metadata');
      }
    }
    
    if (canvasToUse && canvasToUse.components && canvasToUse.components.length > 0) {
      canvasPreservationData = '\n\n🎯 ORIGINAL CANVAS STATE (PRESERVE THESE VALUES):\n';
      canvasToUse.components.forEach((component: CanvasComponent, index: number) => {
        canvasPreservationData += `\n${index + 1}. ${component.type} Component:\n`;
        
        // Position data from canvas
        if (component.position?.xPercent !== undefined && component.position?.yPercent !== undefined) {
          canvasPreservationData += `   - EXACT Position: left: ${component.position.xPercent}%, top: ${component.position.yPercent}%\n`;
        }
        
        // Size data from canvas
        if (component.width || component.height) {
          canvasPreservationData += `   - EXACT Size: width: ${component.width}px, height: ${component.height}px\n`;
        }
        
        // Props from canvas
        Object.entries(component.props).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            canvasPreservationData += `   - ${key}: ${value}\n`;
          }
        });
        
        // Styles from canvas
        if (component.style && Object.keys(component.style).length > 0) {
          canvasPreservationData += `   - Original Styles: ${JSON.stringify(component.style, null, 4)}\n`;
        }
      });
    }

    // Prepare enhanced message with error context and canvas preservation data
    let enhancedUserMessage = `Current React code:\n\`\`\`jsx\n${currentCode}\n\`\`\`\n\nUser question/request: ${message}`;
    
    // Add canvas preservation data
    enhancedUserMessage += canvasPreservationData;
    
    // Add error context if present
    if (errors) {
      let errorContext = '\n\nCurrent Issues:';
      if (errors.compilation) {
        errorContext += `\n- Compilation Error: ${errors.compilation}`;
      }
      if (errors.runtime) {
        errorContext += `\n- Runtime Error: ${errors.runtime}`;
      }
      enhancedUserMessage += errorContext;
      enhancedUserMessage += '\n\nPlease help fix these errors and/or address the user\'s request. When providing code updates:\n\n🔒 CRITICAL: PRESERVE ALL VALUES FROM ORIGINAL CANVAS STATE:\n- Use EXACT positions from canvas (left/top percentages above)\n- Use EXACT sizes from canvas (width/height values above) \n- Keep all original styles and CSS properties from canvas\n- Preserve text content and component props from canvas\n- Maintain original color schemes and visual design from canvas\n\n⚡ ONLY CHANGE what\'s specifically requested or needed to fix errors. Base all preservation on the CANVAS STATE above, not the current code. Return a JSON response with explanation, code, and changes array.\n\n📝 RESPONSE FORMAT: Always return JSON with { "explanation": "...", "code": "...", "changes": [...] }';
    } else {
      enhancedUserMessage += '\n\n🔒 CRITICAL: When making changes, PRESERVE ALL VALUES FROM ORIGINAL CANVAS STATE:\n- Use EXACT positions from canvas state (left/top percentages above)\n- Use EXACT sizes from canvas state (width/height values above)\n- Keep all original styles and CSS properties from canvas state\n- Preserve text content and component props from canvas state\n- Maintain original color schemes and visual design from canvas state\n\n⚡ ONLY modify what\'s specifically requested. Base all preservation on the CANVAS STATE above, not the current code. Enhance without changing core layout, positioning, or sizing from the original canvas design.\n\n📝 RESPONSE FORMAT: For code changes (styling, layout modifications), always return JSON with { "explanation": "...", "code": "...", "changes": [...] } where "code" contains the updated JSX elements.';
    }

    // Add user message to thread
    thread.messages.push({
      id: `msg_${Date.now()}_${thread.messages.length + 1}`,
      role: 'user',
      content: enhancedUserMessage,
      timestamp: new Date()
    });

    // Prepare messages for OpenAI (limit to last 10 messages to avoid token limits)
    const recentMessages = thread.messages.slice(-10);

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: recentMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      max_tokens: 4000,
      temperature: 0.3,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response generated from Azure OpenAI');
    }

    // Add AI response to thread
    thread.messages.push({
      id: `msg_${Date.now()}_${thread.messages.length + 1}`,
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    // Try to parse if response contains code
    let parsedResponse;
    try {
      // Check if response contains JSON with explanation, code, and changes
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      // Not JSON, treat as conversational response
      parsedResponse = null;
    }

    if (parsedResponse && parsedResponse.code) {
      // Analyze the user message to determine if this should be auto-applied
      const userMessage = message.toLowerCase();
      const isSimpleStyleChange = (
        userMessage.includes('color') ||
        userMessage.includes('background') ||
        userMessage.includes('font') ||
        userMessage.includes('size') ||
        userMessage.includes('border') ||
        userMessage.includes('radius') ||
        userMessage.includes('shadow') ||
        userMessage.includes('padding') ||
        userMessage.includes('margin') ||
        userMessage.includes('style') ||
        userMessage.includes('theme') ||
        userMessage.includes('appearance')
      ) && !userMessage.includes('add') && !userMessage.includes('remove') && !userMessage.includes('delete');

      // Response contains new code
      return res.json({
        success: true,
        threadId,
        type: 'code_update',
        explanation: parsedResponse.explanation || 'I\'ve updated your code based on your request and fixed any errors.',
        code: parsedResponse.code,
        changes: parsedResponse.changes || ['Applied requested changes'],
        autoApply: isSimpleStyleChange, // Indicate if this should be auto-applied
        changeType: isSimpleStyleChange ? 'style_update' : 'code_change',
        provider: 'Azure OpenAI (Thread Simulation)'
      });
    } else {
      // Conversational response only
      return res.json({
        success: true,
        threadId,
        type: 'conversation',
        response: aiResponse,
        provider: 'Azure OpenAI (Thread Simulation)'
      });
    }

  } catch (error) {
    console.error('Error continuing thread conversation with Azure OpenAI:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to continue conversation'
    });
  }
});

// GET /api/ai/conversation/:id - Get thread history
router.get('/conversation/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Thread ID is required'
    });
  }
  
  const thread = threads.get(id);
  
  if (!thread) {
    return res.status(404).json({
      success: false,
      error: 'Thread not found'
    });
  }

  return res.json({
    success: true,
    thread: {
      id: thread.id,
      messages: thread.messages.map((msg: ThreadMessage) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      })),
      metadata: thread.metadata,
      createdAt: thread.createdAt
    }
  });
});

// Helper functions

// Generate system prompt based on output type
function getSystemPrompt(outputType: string): string {
  const basePrompt = "You are an expert web developer who creates high-quality, modern, and responsive code.";
  
  switch (outputType) {
    case 'react':
      return `${basePrompt} CRITICAL: Generate ONLY JSX elements that represent the actual components from the canvas design. PRESERVE ALL EXISTING:

✅ MUST PRESERVE:
- Exact position values (left/top percentages) from the canvas state
- Current width and height dimensions in pixels
- All existing custom styles and CSS properties
- Component text content and props exactly as provided
- Color schemes, fonts, and visual styling

❌ DO NOT include:
- Headers, main tags, or page-level structure
- Component definitions, functions, or imports/exports  
- Wrapper divs or containers unless specifically requested
- Page titles or headings unless they are actual components from the canvas

🎯 POSITIONING RULES:
- Use EXACT position values from canvas state: style={{ left: 'X%', top: 'Y%' }}
- Maintain EXACT width/height: style={{ width: 'Xpx', height: 'Ypx' }}
- Use absolute positioning for all elements
- Preserve any existing transform, margin, padding values

🎨 STYLING RULES:
- Keep ALL existing custom styles from component.style
- Preserve current Tailwind classes and add enhancements only
- Maintain existing colors, fonts, borders, shadows
- Add only complementary hover effects and transitions

Example format preserving exact positions and sizes:
<button className="absolute px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all" style={{ left: '45.2%', top: '12.8%', width: '120px', height: '40px' }}>Exact Text</button>

NEVER change positions, sizes, or core styling - only enhance what exists.`;
    
    case 'html':
      return `${basePrompt} Generate semantic HTML5 with modern CSS (or Tailwind CSS), ensuring accessibility, responsive design, and clean markup structure. Include proper meta tags and semantic elements.`;
    
    case 'css':
      return `${basePrompt} Generate modern CSS with flexbox/grid layouts, custom properties, responsive design, and smooth animations. Use BEM methodology or utility-first approach. Include hover effects and transitions.`;
    
    case 'nextjs':
      return `${basePrompt} Generate a Next.js component with proper file structure, TypeScript, and modern Next.js features like app router, server components when appropriate. Include proper SEO and performance optimizations.`;
    
    case 'vue':
      return `${basePrompt} Generate Vue 3 composition API components with TypeScript, proper reactivity, and modern Vue patterns. Use script setup syntax and modern Vue best practices.`;
    
    default:
      return basePrompt;
  }
}

// Generate detailed prompt from canvas state
function generatePrompt(canvasState: CanvasState, outputType: string, customPrompt?: string): string {
  const { components, pageTitle, theme } = canvasState;
  
  let prompt = `Create a ${outputType} implementation based on this design specification:\n\n`;
  
  if (pageTitle) {
    prompt += `Page Title: ${pageTitle}\n`;
  }
  
  if (theme) {
    prompt += `Theme: ${theme}\n`;
  }
  
  prompt += `Components Layout:\n`;
  
  components.forEach((component, index) => {
    prompt += `\n${index + 1}. ${component.type} Component:\n`;
    
    // Detailed position information
    if (component.position?.xPercent !== undefined && component.position?.yPercent !== undefined) {
      prompt += `   - EXACT Position (MUST PRESERVE): left: ${component.position.xPercent}%, top: ${component.position.yPercent}%\n`;
    } else {
      prompt += `   - Position: top-left (default)\n`;
    }
    
    // Detailed size information
    if (component.width || component.height) {
      prompt += `   - EXACT Size (MUST PRESERVE): width: ${component.width || 'auto'}px, height: ${component.height || 'auto'}px\n`;
    }
    
    // Add component-specific properties
    Object.entries(component.props).forEach(([key, value]) => {
      if (key !== 'width' && key !== 'height' && value !== null && value !== undefined) {
        prompt += `   - ${key} (PRESERVE EXACTLY): ${value}\n`;
      }
    });
    
    // Detailed style preservation
    if (component.style && Object.keys(component.style).length > 0) {
      prompt += `   - EXISTING Custom styles (MUST PRESERVE ALL): ${JSON.stringify(component.style, null, 4)}\n`;
    }
  });
  
  prompt += `\n🔒 CRITICAL PRESERVATION REQUIREMENTS:\n`;
  prompt += `- PRESERVE EXACT positions: Use the EXACT xPercent and yPercent values provided\n`;
  prompt += `- PRESERVE EXACT sizes: Use the EXACT width and height pixel values provided\n`;
  prompt += `- PRESERVE ALL existing styles: Keep every CSS property from component.style\n`;
  prompt += `- PRESERVE EXACT text content: Keep all text, labels, and content exactly as specified\n`;
  prompt += `- PRESERVE component props: Keep all existing properties unchanged\n`;
  
  prompt += `\n⚡ ENHANCEMENT RULES:\n`;
  prompt += `- Generate ONLY JSX elements, not complete React components\n`;
  prompt += `- Use HTML tags like <button>, <p>, <div>, <img>, etc. with React props (className, style, onClick)\n`;
  prompt += `- Use absolute positioning with the EXACT percentage values: style={{ left: 'X%', top: 'Y%' }}\n`;
  prompt += `- Add Tailwind CSS classes for styling enhancement (className prop) but preserve existing styles\n`;
  prompt += `- Add ONLY complementary hover effects and transitions - do not change base styling\n`;
  prompt += `- Make elements responsive and accessible without changing core positioning\n`;
  prompt += `- DO NOT include component definitions, imports, exports, or wrapper functions\n`;
  
  prompt += `\n📐 POSITIONING EXAMPLE:\n`;
  prompt += `If canvas shows: position: { xPercent: 45.2, yPercent: 12.8 }, width: 120, height: 40\n`;
  prompt += `Generate: <button className="absolute px-4 py-2 bg-blue-600 hover:bg-blue-700" style={{ left: '45.2%', top: '12.8%', width: '120px', height: '40px' }}>Text</button>\n`;
  
  if (customPrompt) {
    prompt += `\nAdditional Requirements:\n${customPrompt}\n`;
  }
  
  prompt += `\nIMPORTANT: Generate ONLY JSX elements (no component definitions, imports, or exports). Return only the JSX code that can be directly inserted into a React component's return statement.`;
  
  return prompt;
}

// Parse generated code and structure response
function parseGeneratedCode(generatedCode: string, outputType: string) {
  // Try to extract code blocks if wrapped in markdown
  const codeBlockRegex = /```(?:\w+)?\n([\s\S]*?)\n```/g;
  const matches = [...generatedCode.matchAll(codeBlockRegex)];
  
  if (matches.length > 0 && matches[0] && matches[0][1]) {
    // If code blocks found, use the first one
    return {
      main: matches[0][1].trim(),
      raw: generatedCode,
      type: outputType
    };
  }
  
  // If no code blocks, return the raw content
  return {
    main: generatedCode.trim(),
    raw: generatedCode,
    type: outputType
  };
}

// Fallback code generation (non-AI)
function generateFallbackCode(canvasState: CanvasState, outputType: string) {
  const { components } = canvasState;
  
  switch (outputType) {
    case 'react':
      return generateFallbackReact(components);
    case 'html':
      return generateFallbackHTML(components);
    case 'css':
      return generateFallbackCSS(components);
    default:
      return { main: '// Fallback code generation not implemented for this type' };
  }
}

function generateFallbackReact(components: CanvasComponent[]) {
  let jsx = `import React from 'react';\n\nconst GeneratedComponent = () => {\n  return (\n    <div className="min-h-screen bg-gray-50 relative">\n`;
  
  components.forEach(component => {
    const width = component.width || component.props.width;
    const height = component.height || component.props.height;
    
    jsx += `      <div className="absolute" style={{ \n`;
    jsx += `        left: '${component.position?.xPercent || 0}%', \n`;
    jsx += `        top: '${component.position?.yPercent || 0}%',\n`;
    if (width) jsx += `        width: '${width}px',\n`;
    if (height) jsx += `        height: '${height}px'\n`;
    jsx += `      }}>\n`;
    
    switch (component.type) {
      case 'Button':
        jsx += `        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">\n`;
        jsx += `          ${component.props.text || 'Button'}\n`;
        jsx += `        </button>\n`;
        break;
      case 'Text':
        jsx += `        <p className="text-gray-900">${component.props.content || 'Text'}</p>\n`;
        break;
      case 'Image':
        jsx += `        <img \n`;
        jsx += `          src="${component.props.src || 'https://via.placeholder.com/300x200'}" \n`;
        jsx += `          alt="${component.props.alt || 'Image'}" \n`;
        jsx += `          className="rounded-lg object-cover"\n`;
        if (width && height) jsx += `          style={{ width: '${width}px', height: '${height}px' }}\n`;
        jsx += `        />\n`;
        break;
      case 'Card':
        jsx += `        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">\n`;
        if (component.props.showImage) {
          jsx += `          <img src="${component.props.imageSrc || 'https://via.placeholder.com/400x200'}" alt="${component.props.imageAlt || 'Card image'}" className="w-full h-32 object-cover" />\n`;
        }
        jsx += `          <div className="p-4">\n`;
        if (component.props.title) jsx += `            <h3 className="text-lg font-semibold text-gray-900 mb-2">${component.props.title}</h3>\n`;
        if (component.props.content) jsx += `            <p className="text-gray-600">${component.props.content}</p>\n`;
        jsx += `          </div>\n`;
        jsx += `        </div>\n`;
        break;
    }
    
    jsx += `      </div>\n`;
  });
  
  jsx += `    </div>\n  );\n};\n\nexport default GeneratedComponent;`;
  
  return { main: jsx };
}

function generateFallbackHTML(components: CanvasComponent[]) {
  let html = `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Generated Page</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="min-h-screen bg-gray-50 relative">\n`;
  
  components.forEach(component => {
    const width = component.width || component.props.width;
    const height = component.height || component.props.height;
    
    html += `  <div class="absolute" style="left: ${component.position?.xPercent || 0}%; top: ${component.position?.yPercent || 0}%;`;
    if (width) html += ` width: ${width}px;`;
    if (height) html += ` height: ${height}px;`;
    html += `">\n`;
    
    switch (component.type) {
      case 'Button':
        html += `    <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">${component.props.text || 'Button'}</button>\n`;
        break;
      case 'Text':
        html += `    <p class="text-gray-900">${component.props.content || 'Text'}</p>\n`;
        break;
      case 'Image':
        html += `    <img src="${component.props.src || 'https://via.placeholder.com/300x200'}" alt="${component.props.alt || 'Image'}" class="rounded-lg object-cover"`;
        if (width && height) html += ` style="width: ${width}px; height: ${height}px;"`;
        html += `>\n`;
        break;
      case 'Card':
        html += `    <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">\n`;
        if (component.props.showImage) {
          html += `      <img src="${component.props.imageSrc || 'https://via.placeholder.com/400x200'}" alt="${component.props.imageAlt || 'Card image'}" class="w-full h-32 object-cover">\n`;
        }
        html += `      <div class="p-4">\n`;
        if (component.props.title) html += `        <h3 class="text-lg font-semibold text-gray-900 mb-2">${component.props.title}</h3>\n`;
        if (component.props.content) html += `        <p class="text-gray-600">${component.props.content}</p>\n`;
        html += `      </div>\n`;
        html += `    </div>\n`;
        break;
    }
    
    html += `  </div>\n`;
  });
  
  html += `</body>\n</html>`;
  
  return { main: html };
}

function generateFallbackCSS(components: CanvasComponent[]) {
  let css = `/* Generated CSS */\n.container {\n  position: relative;\n  min-height: 100vh;\n  background-color: #f9fafb;\n}\n\n`;
  
  components.forEach((component, index) => {
    css += `.component-${index} {\n`;
    css += `  position: absolute;\n`;
    css += `  left: ${component.position?.xPercent || 0}%;\n`;
    css += `  top: ${component.position?.yPercent || 0}%;\n`;
    
    const width = component.width || component.props.width;
    const height = component.height || component.props.height;
    
    if (width) css += `  width: ${width}px;\n`;
    if (height) css += `  height: ${height}px;\n`;
    
    // Add component-specific styles
    switch (component.type) {
      case 'Button':
        css += `  padding: 1rem 2rem;\n`;
        css += `  background: #3b82f6;\n`;
        css += `  color: white;\n`;
        css += `  border: none;\n`;
        css += `  border-radius: 0.5rem;\n`;
        css += `  cursor: pointer;\n`;
        css += `  transition: background-color 0.2s;\n`;
        break;
      case 'Text':
        css += `  color: #111827;\n`;
        css += `  font-family: system-ui, -apple-system, sans-serif;\n`;
        break;
      case 'Image':
        css += `  border-radius: 0.5rem;\n`;
        css += `  object-fit: cover;\n`;
        break;
      case 'Card':
        css += `  background: white;\n`;
        css += `  border-radius: 0.5rem;\n`;
        css += `  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);\n`;
        css += `  border: 1px solid #e5e7eb;\n`;
        break;
    }
    
    css += `}\n\n`;
  });
  
  return { main: css };
}

// Generate smart suggestions based on canvas state
function generateSuggestions(canvasState?: any): string[] {
  if (!canvasState || !canvasState.components) {
    return [
      "Start by adding a header component",
      "Create a hero section",
      "Add a navigation menu",
      "Include a footer"
    ];
  }

  const components = canvasState.components;
  const suggestions: string[] = [];

  // Check what components are missing
  const hasButton = components.some((c: any) => c.type === 'Button');
  const hasText = components.some((c: any) => c.type === 'Text');
  const hasImage = components.some((c: any) => c.type === 'Image');
  const hasCard = components.some((c: any) => c.type === 'Card');

  if (!hasButton) suggestions.push("Add a call-to-action button");
  if (!hasText) suggestions.push("Include descriptive text content");
  if (!hasImage) suggestions.push("Add visual elements with images");
  if (!hasCard) suggestions.push("Organize content with card components");

  // General suggestions
  suggestions.push("Improve responsive design");
  suggestions.push("Add hover animations");
  suggestions.push("Optimize for mobile devices");

  return suggestions.slice(0, 4); // Limit to 4 suggestions
}

export default router;
