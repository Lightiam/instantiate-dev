import { Handler } from '@netlify/functions';
import { registerRoutes } from '../../server/routes.js';
import express from 'express';

const app = express();

let routesInitialized = false;

async function initializeRoutes() {
  if (!routesInitialized) {
    await registerRoutes(app);
    routesInitialized = true;
  }
}

export const handler: Handler = async (event, context) => {
  await initializeRoutes();
  
  // Handle API requests through Express app
  return new Promise((resolve, reject) => {
    const req = {
      method: event.httpMethod,
      url: event.path,
      headers: event.headers,
      body: event.body
    };
    
    const res = {
      statusCode: 200,
      headers: {},
      body: '',
      status: (code) => { res.statusCode = code; return res; },
      json: (data) => { res.body = JSON.stringify(data); return res; },
      send: (data) => { res.body = data; return res; },
      setHeader: (key, value) => { res.headers[key] = value; }
    };

    try {
      app(req, res);
      resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body: res.body
      });
    } catch (error) {
      reject(error);
    }
  });
};
