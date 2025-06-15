
import type { Express } from "express";
import { multiCloudRoutes } from "./routes/multi-cloud-routes";

export function registerRoutes(app: Express): void {
  // Multi-cloud deployment routes
  app.use("/api/multi-cloud", multiCloudRoutes);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Legacy deployments endpoint for backwards compatibility
  app.get("/api/deployments", (req, res) => {
    res.json([]);
  });

  // Legacy projects endpoint
  app.get("/api/projects", (req, res) => {
    res.json([]);
  });
}
