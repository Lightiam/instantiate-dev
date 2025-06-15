
import { ViteDevServer } from 'vite';
import express from 'express';

export async function setupVite(app: express.Application, server: any) {
  // Development setup - this would be implemented for dev mode
  console.log('Vite setup for development');
}

export function serveStatic(app: express.Application) {
  // Production static file serving
  app.use(express.static('dist'));
}

export function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}
