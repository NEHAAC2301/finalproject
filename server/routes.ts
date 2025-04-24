import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { randomUUID } from "crypto";
import { WebSocketServer } from "ws";
import { z } from "zod";
import { analyzeQuery, generateResponse } from "./services/openai";
import { getKnowledgeBaseItems } from "./services/knowledge-base";
import { 
  insertMessageSchema, 
  insertTicketSchema, 
  insertTicketUpdateSchema, 
  MessageRole, 
  TicketStatus,
  TicketPriority,
  TicketCreator
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Add a static HTML page that doesn't rely on Vite or other complex dependencies
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ammu - University Support Bot</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px; 
            }
            header {
              background-color: #2563eb;
              color: white;
              padding: 1rem;
              border-radius: 8px;
              margin-bottom: 2rem;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            h1 { margin: 0; }
            .user-info {
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }
            .avatar {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background-color: #e5e7eb;
              overflow: hidden;
            }
            .avatar img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .chat-container { 
              border: 1px solid #e5e7eb; 
              border-radius: 8px; 
              padding: 16px; 
              margin-top: 24px; 
              background-color: #f9fafb; 
            }
            .message { 
              margin-bottom: 12px; 
              padding: 10px 16px; 
              border-radius: 8px; 
              max-width: 80%; 
            }
            .bot { 
              background-color: #dbeafe; 
              align-self: flex-start; 
            }
            .chat-history {
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 1rem;
              margin-bottom: 1rem;
              max-height: 300px;
              overflow-y: auto;
            }
            .input-container { 
              display: flex; 
              margin-top: 16px; 
            }
            input { 
              flex-grow: 1; 
              padding: 10px; 
              border: 1px solid #d1d5db; 
              border-radius: 6px; 
              margin-right: 8px; 
            }
            button { 
              background-color: #2563eb; 
              color: white; 
              font-weight: 500; 
              padding: 10px 16px; 
              border: none; 
              border-radius: 6px; 
              cursor: pointer; 
            }
            button:hover { 
              background-color: #1d4ed8; 
            }
            .card-container {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
              gap: 1rem;
              margin-top: 2rem;
            }
            .card {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 1rem;
              cursor: pointer;
              transition: all 0.2s ease;
            }
            .card:hover {
              transform: translateY(-2px);
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }
            .card-tickets {
              background-color: #dbeafe;
              border-color: #bfdbfe;
            }
            .card-knowledge {
              background-color: #fef3c7;
              border-color: #fde68a;
            }
            .card h3 {
              margin-top: 0;
              font-size: 1.1rem;
            }
          </style>
        </head>
        <body>
          <header>
            <h1>Ammu</h1>
            <div class="user-info">
              <span>Emily Parker</span>
              <div class="avatar">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&auto=format" alt="User avatar">
              </div>
            </div>
          </header>
          
          <h2>University Support Assistant</h2>
          <p>
            Welcome to Ammu! I'm here to help you with university-related questions, issues, and services.
            How can I assist you today?
          </p>
          
          <div class="chat-container">
            <div class="chat-history">
              <div class="message bot">
                Hi there, Emily! I'm Ammu, your university support assistant. How can I help you today?
              </div>
            </div>
            
            <div class="input-container">
              <input type="text" id="message-input" placeholder="Type your message..." disabled>
              <button id="send-button" disabled>Send</button>
            </div>
          </div>
          
          <div class="card-container">
            <div class="card card-tickets">
              <h3>My Tickets</h3>
              <p>View and manage your support requests</p>
            </div>
            
            <div class="card card-knowledge">
              <h3>Knowledge Base</h3>
              <p>Browse helpful resources and FAQs</p>
            </div>
          </div>
          
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              const messageInput = document.getElementById('message-input');
              const sendButton = document.getElementById('send-button');
              const chatHistory = document.querySelector('.chat-history');
              
              // Demo version only - we don't have actual WebSocket functionality
              messageInput.removeAttribute('disabled');
              sendButton.removeAttribute('disabled');
              
              sendButton.addEventListener('click', function() {
                const message = messageInput.value.trim();
                if (message) {
                  // Add user message
                  const userMessageEl = document.createElement('div');
                  userMessageEl.className = 'message user';
                  userMessageEl.style.backgroundColor = '#f3f4f6';
                  userMessageEl.style.marginLeft = 'auto';
                  userMessageEl.textContent = message;
                  chatHistory.appendChild(userMessageEl);
                  
                  // Clear input
                  messageInput.value = '';
                  
                  // Simulate response after delay
                  setTimeout(() => {
                    const botMessageEl = document.createElement('div');
                    botMessageEl.className = 'message bot';
                    botMessageEl.textContent = "I'm sorry, but this is just a static demonstration. In the actual application, I would process your question and provide a helpful response!";
                    chatHistory.appendChild(botMessageEl);
                    
                    // Scroll to bottom
                    chatHistory.scrollTop = chatHistory.scrollHeight;
                  }, 1000);
                }
              });
              
              // Allow Enter key to send messages
              messageInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                  sendButton.click();
                }
              });
            });
          </script>
        </body>
      </html>
    `);
  });
  
  // Create WebSocket server to handle chat messages
  const wss = new WebSocketServer({ server: httpServer, path: '/websocket' });
  
  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log("Received message:", data);
        
        // First send acknowledgment
        ws.send(JSON.stringify({ 
          type: "message_received",
          messageId: Date.now()
        }));
        
        // Process the message
        if (data.type === "message") {
          const { userId, content, conversationId } = data;
          
          // Save the message to the database
          const savedMessage = await storage.createMessage({
            userId,
            content,
            role: 'user',
            conversationId,
            timestamp: new Date()
          });
          
          // Generate a response using the knowledge base
          console.log("Searching for:", content);
          
          // Analyze the query for keywords
          const keywords = content.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3);
            
          console.log("Keywords:", keywords);
          
          // Get relevant knowledge items
          const { getKnowledgeBaseItems } = await import('./services/knowledge-base');
          const knowledgeItems = await getKnowledgeBaseItems(undefined, keywords);
          
          // Generate response based on knowledge base or a default response
          let responseContent = "";
          
          if (knowledgeItems.length > 0) {
            // Use the most relevant item for the response
            const mainItem = knowledgeItems[0];
            responseContent = `Based on our knowledge base: ${mainItem.content}`;
            
            // If there are more items, add a summary
            if (knowledgeItems.length > 1) {
              responseContent += "\n\nI found some additional information that might be helpful:";
              knowledgeItems.slice(1, 3).forEach(item => {
                responseContent += `\n\n- ${item.title}: ${item.content.substring(0, 100)}...`;
              });
            }
          } else {
            responseContent = "I don't have specific information about that in my knowledge base. Would you like me to create a support ticket so a staff member can assist you?";
          }
          
          // Save the assistant's response
          const assistantMessage = await storage.createMessage({
            userId,
            content: responseContent,
            role: 'assistant',
            conversationId,
            timestamp: new Date()
          });
          
          // Send the response back to the client
          setTimeout(() => {
            ws.send(JSON.stringify({
              type: "assistant_response",
              message: assistantMessage
            }));
          }, 1000); // Small delay to simulate thinking
        }
        
      } catch (error) {
        console.error("Error processing WebSocket message:", error);
        ws.send(JSON.stringify({
          type: "error",
          error: "Failed to process message"
        }));
      }
    });
  });

  // API Routes
  
  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).send("Server is healthy");
  });

  // Transcription endpoint for audio files
  app.post("/api/transcribe", async (req, res) => {
    try {
      if (!req.body || !req.body.audio) {
        return res.status(400).json({ error: "Audio data is required" });
      }
      
      // Convert base64 string to buffer
      const audioData = req.body.audio;
      const audioBuffer = Buffer.from(audioData.split(';base64,').pop(), 'base64');
      
      // Generate a unique filename
      const filename = `recording-${Date.now()}.webm`;
      
      // Import the transcribeAudio function
      const { transcribeAudio } = await import('./services/openai');
      
      // Transcribe the audio
      const transcription = await transcribeAudio(audioBuffer, filename);
      
      // Return the result
      res.json(transcription);
    } catch (error: any) {
      console.error("Error in transcription endpoint:", error);
      res.status(500).json({ 
        error: "Failed to transcribe audio", 
        details: error.message || "Unknown error"
      });
    }
  });
  
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  app.get("/api/messages/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const messages = await storage.getMessagesByUserId(userId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  
  app.get("/api/tickets/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const tickets = await storage.getTicketsByUserId(userId);
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });
  
  app.get("/api/ticket/:id", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const ticket = await storage.getTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      const updates = await storage.getTicketUpdates(ticketId);
      
      res.json({ ticket, updates });
    } catch (error) {
      console.error("Error fetching ticket:", error);
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });
  
  app.post("/api/ticket-update", async (req, res) => {
    try {
      const updateData = insertTicketUpdateSchema.parse(req.body);
      const update = await storage.createTicketUpdate(updateData);
      res.status(201).json(update);
    } catch (error) {
      console.error("Error creating ticket update:", error);
      res.status(500).json({ message: "Failed to create ticket update" });
    }
  });
  
  // Knowledge Base API Endpoints
  app.get("/api/knowledge", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const keywords = req.query.keywords ? (req.query.keywords as string).split(',') : undefined;
      
      const { getKnowledgeBaseItems } = await import('./services/knowledge-base');
      const items = await getKnowledgeBaseItems(category, keywords);
      
      res.json(items);
    } catch (error) {
      console.error("Error fetching knowledge base items:", error);
      res.status(500).json({ message: "Failed to fetch knowledge base items" });
    }
  });
  
  app.post("/api/knowledge/batch", async (req, res) => {
    try {
      if (!Array.isArray(req.body)) {
        return res.status(400).json({ 
          message: "Request body must be an array of knowledge base items" 
        });
      }
      
      const { addBatchToKnowledgeBase } = await import('./services/knowledge-base');
      const result = await addBatchToKnowledgeBase(req.body);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error("Error adding batch to knowledge base:", error);
      res.status(500).json({ 
        message: "Failed to add items to knowledge base",
        error: error?.message || "Unknown error"
      });
    }
  });
  
  app.post("/api/knowledge/text", async (req, res) => {
    try {
      if (!req.body.text || !req.body.category) {
        return res.status(400).json({ 
          message: "Both text content and category are required" 
        });
      }
      
      const { processTextDocument } = await import('./services/knowledge-base');
      const result = await processTextDocument(
        req.body.text,
        req.body.category,
        req.body.chunkSize || 1000,
        req.body.overlapSize || 200
      );
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error: any) {
      console.error("Error processing text for knowledge base:", error);
      res.status(500).json({ 
        message: "Failed to process text for knowledge base",
        error: error?.message || "Unknown error"
      });
    }
  });

  // Create a temporary test user if none exists
  const testUser = await storage.getUserByUsername("student");
  if (!testUser) {
    try {
      await storage.createUser({
        username: "student",
        password: "password",
        fullName: "Emily Parker",
        studentId: "SP2023456",
        profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&auto=format"
      });
      console.log("Created test user: student/password");
    } catch (error) {
      console.error("Failed to create test user:", error);
    }
  }

  return httpServer;
}
