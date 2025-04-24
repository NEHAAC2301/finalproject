import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add a simple test route to verify the server is working
app.get("/health", (req, res) => {
  res.status(200).send("Server is healthy");
});

// Add a simple debug route to see environment variables
app.get("/debug", (req, res) => {
  res.status(200).json({
    env: process.env.NODE_ENV,
    host: req.headers.host,
    url: req.url,
    time: new Date().toISOString()
  });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      console.error("Server error:", err);
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      try {
        await setupVite(app, server);
      } catch (error) {
        console.error("Error setting up Vite:", error);
        
        // Fall back to serving static files if Vite setup fails
        app.get('/', (req, res) => {
          res.send(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>UniAssist</title>
                <style>
                  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
                  h1 { color: #2563eb; }
                  .chat-container { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 24px; background-color: #f9fafb; }
                  .message { margin-bottom: 12px; padding: 10px 16px; border-radius: 8px; max-width: 80%; }
                  .bot { background-color: #dbeafe; align-self: flex-start; }
                  .input-container { display: flex; margin-top: 16px; }
                  input { flex-grow: 1; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; margin-right: 8px; }
                  button { background-color: #2563eb; color: white; font-weight: 500; padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; }
                  button:hover { background-color: #1d4ed8; }
                </style>
              </head>
              <body>
                <h1>UniAssist - University Support Assistant</h1>
                <p>Welcome to UniAssist! This is a simplified version of the application.</p>
                
                <div class="chat-container">
                  <div class="message bot">
                    Hi there! I'm UniAssist, your university support assistant. How can I help you today?
                  </div>
                  
                  <div class="input-container">
                    <input type="text" placeholder="Type your message...">
                    <button>Send</button>
                  </div>
                </div>
              </body>
            </html>
          `);
        });
      }
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on port 5000
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
      console.log(`Server started at http://0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
})();
