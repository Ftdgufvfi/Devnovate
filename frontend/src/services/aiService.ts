// AI Service for communicating with backend AI API
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

      const response = await fetch(`${this.baseURL}/ai/conversation/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start conversation');
      }

      return data;
    } catch (error) {
      console.error('Error starting AI conversation:', error);
      throw error;
    }
  }

  async continueConversation(threadId: string, message: string, currentCode: string, errors?: {
    compilation?: string;
    runtime?: string;
  }, canvasState?: any) {
    try {
      const response = await fetch(`${this.baseURL}/ai/conversation/continue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: threadId, // Backend still expects 'conversationId' key but it's actually a threadId
          message,
          currentCode,
          errors,
          canvasState // Pass canvas state for preservation
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to continue conversation');
      }

      return data;
    } catch (error) {
      console.error('Error continuing AI conversation:', error);
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
}

export const aiService = new AIService();
export default AIService;
