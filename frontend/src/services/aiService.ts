// AI Service for communicating with backend AI API
import { tableService, CustomTable } from './tableService';

class AIService {
  private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  async generateFromCanvas(canvasState: any, outputType: string, customPrompt?: string) {
    try {
      const response = await fetch(`${this.baseURL}/ai/generate-from-canvas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          canvasState,
          outputType,
          customPrompt
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate code');
      }

      return data;
    } catch (error) {
      console.error('Error calling AI API:', error);
      throw error;
    }
  }

  async startConversation(canvasState: any, outputType: string = 'react', conversationId?: string) {
    try {
      const requestBody: any = {
        canvasState,
        outputType
      };
      
      // Include conversation ID if provided (for session restoration)
      if (conversationId) {
        requestBody.conversationId = conversationId;
      }

      console.log('AI Service: Making startConversation request:', {
        url: `${this.baseURL}/ai/conversation/start`,
        outputType,
        hasCanvasState: !!canvasState,
        hasConversationId: !!conversationId,
        componentsCount: canvasState?.components?.length || 0
      });

      const response = await fetch(`${this.baseURL}/ai/conversation/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('AI Service: Start conversation response status:', response.status, response.statusText);

      const data = await response.json();
      
      console.log('AI Service: Start conversation response data:', {
        success: data.success,
        hasThreadId: !!data.threadId,
        hasConversationId: !!data.conversationId,
        hasCode: !!data.code,
        restored: data.restored,
        error: data.error
      });

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to start conversation`);
      }

      return data;
    } catch (error) {
      console.error('AI Service: Error starting conversation:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to AI service. Please check your internet connection.');
      }
      throw error;
    }
  }

  async continueConversation(threadId: string, message: string, currentCode: string, errors?: {
    compilation?: string;
    runtime?: string;
  }, canvasState?: any) {
    try {
      const requestData = {
        conversationId: threadId, // Backend still expects 'conversationId' key but it's actually a threadId
        message,
        currentCode,
        errors,
        canvasState // Pass canvas state for preservation
      };
      
      console.log('AI Service: Making continueConversation request:', {
        url: `${this.baseURL}/ai/conversation/continue`,
        threadId,
        messageLength: message.length,
        codeLength: currentCode.length,
        hasErrors: !!errors,
        hasCanvasState: !!canvasState
      });

      const response = await fetch(`${this.baseURL}/ai/conversation/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('AI Service: Response status:', response.status, response.statusText);

      const data = await response.json();
      
      console.log('AI Service: Response data:', {
        success: data.success,
        type: data.type,
        hasCode: !!data.code,
        error: data.error
      });

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: Failed to continue conversation`);
      }

      return data;
    } catch (error) {
      console.error('AI Service: Error continuing conversation:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to AI service. Please check your internet connection.');
      }
      throw error;
    }
  }

  async chatWithAI(message: string, canvasState?: any, context?: string) {
    try {
      const response = await fetch(`${this.baseURL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          canvasState,
          context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to chat with AI');
      }

      return data;
    } catch (error) {
      console.error('Error calling AI chat API:', error);
      throw error;
    }
  }

  // Get available API endpoints for a project to include in AI context
  async getEndpointsContext(projectId: string): Promise<string> {
    try {
      const tables = await tableService.getTables(projectId);
      
      if (tables.length === 0) {
        return "No custom tables/endpoints available for this project.";
      }

      let context = "Available API Endpoints for data integration:\n\n";
      context += "Base URL: http://localhost:5000\n";
      context += "Authentication: Required (JWT token in Authorization header)\n\n";

      tables.forEach((table) => {
        context += `Table: ${table.displayName} (${table.name})\n`;
        context += `- GET /api/data/${table._id} - Get all records (supports pagination)\n`;
        context += `- GET /api/data/${table._id}/{recordId} - Get specific record\n`;
        context += `- POST /api/data/${table._id} - Create new record\n`;
        context += `- PUT /api/data/${table._id}/{recordId} - Update record\n`;
        context += `- DELETE /api/data/${table._id}/{recordId} - Delete record\n`;
        
        context += `Fields: ${table.fields.map(f => `${f.name}(${f.type}${f.required ? ',required' : ''})`).join(', ')}\n`;
        
        // Add sample data structure
        const sampleData = table.fields.reduce((acc, field) => {
          acc[field.name] = field.type === 'number' ? 0 : 
                            field.type === 'boolean' ? false :
                            field.type === 'date' ? '2025-09-14' : 
                            `sample_${field.name}`;
          return acc;
        }, {} as Record<string, any>);
        
        context += `Sample data: ${JSON.stringify(sampleData, null, 2)}\n\n`;
      });

      context += "Integration Notes:\n";
      context += "- Use fetch() or axios for API calls\n";
      context += "- Include 'Authorization: Bearer {token}' header\n";
      context += "- All responses are in JSON format\n";
      context += "- GET endpoints support ?page=1&limit=10 for pagination\n";

      return context;
    } catch (error) {
      console.error('Error getting endpoints context:', error);
      return "Error loading available endpoints.";
    }
  }

  // Enhanced conversation start with endpoint context
  async startConversationWithEndpoints(canvasState: any, projectId: string, outputType: string = 'react', conversationId?: string) {
    try {
      // Get endpoints context
      const endpointsContext = await this.getEndpointsContext(projectId);
      
      const requestBody: any = {
        canvasState,
        outputType,
        endpointsContext // Include available endpoints in context
      };
      
      if (conversationId) {
        requestBody.conversationId = conversationId;
      }

      console.log('AI Service: Starting conversation with endpoints context');

      const response = await fetch(`${this.baseURL}/ai/conversation/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start AI conversation');
      }

      return data;
    } catch (error) {
      console.error('Error starting AI conversation with endpoints:', error);
      throw error;
    }
  }

  // Enhanced continue conversation with endpoint context
  async continueConversationWithEndpoints(conversationId: string, message: string, currentCode: string, projectId: string, errors?: any) {
    try {
      // Get fresh endpoints context
      const endpointsContext = await this.getEndpointsContext(projectId);
      
      const response = await fetch(`${this.baseURL}/ai/conversation/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          message,
          currentCode,
          errors,
          endpointsContext
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to continue conversation');
      }

      return data;
    } catch (error) {
      console.error('Error continuing AI conversation with endpoints:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
export default AIService;
