
import type { Express } from "express";
import { multiCloudRoutes } from "./routes/multi-cloud-routes";
import authRoutes from "./routes/auth-routes";
import { credentialsRoutes } from "./routes/credentials-routes";
import { openaiService } from "./openai-ai-service";

export function registerRoutes(app: Express): void {
  app.use("/api/auth", authRoutes);
  
  // Multi-cloud deployment routes
  app.use("/api/multi-cloud", multiCloudRoutes);
  
  // Credentials management routes
  app.use("/api/credentials", credentialsRoutes);

  // AI Chat routes using OpenAI service
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, provider, resourceType, chatHistory } = req.body;
      
      const context = {
        userQuery: message,
        provider,
        resourceType
      };
      
      const response = await openaiService.generateResponse(context, chatHistory || []);
      res.json(response);
    } catch (error: any) {
      console.error('AI Chat error:', error);
      res.status(500).json({
        message: 'I encountered an issue processing your request. Please try again.',
        error: error.message
      });
    }
  });

  app.post("/api/ai/generate-iac", async (req, res) => {
    try {
      const { prompt, provider, codeType } = req.body;
      
      const result = await openaiService.generateInfrastructureCode(
        prompt,
        provider || 'azure',
        codeType || 'terraform'
      );
      
      res.json({
        terraform: result.code,
        description: result.explanation,
        resourceType: 'generated'
      });
    } catch (error: any) {
      console.error('IaC Generation error:', error);
      res.status(500).json({
        error: 'Failed to generate infrastructure code',
        message: error.message
      });
    }
  });

  // Azure specific routes for backwards compatibility
  app.post("/api/azure/generate-iac", async (req, res) => {
    try {
      const { prompt, resourceType } = req.body;
      
      const result = await openaiService.generateInfrastructureCode(
        prompt,
        'azure',
        'terraform'
      );
      
      res.json({
        terraform: result.code,
        description: result.explanation,
        resourceType: resourceType || 'generated'
      });
    } catch (error: any) {
      console.error('Azure IaC Generation error:', error);
      res.status(500).json({
        error: 'Failed to generate Azure infrastructure code',
        message: error.message
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Legacy endpoints for backwards compatibility
  app.get("/api/deployments", (req, res) => {
    res.json([]);
  });

  app.get("/api/projects", (req, res) => {
    res.json([]);
  });
}
