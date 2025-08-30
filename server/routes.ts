import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertOfferSchema, insertJoinRequestSchema, insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    const userId = req.url?.split('userId=')[1];
    if (userId) {
      clients.set(userId, ws);
    }

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'chat_message') {
          // Store message and broadcast to other user
          const newMessage = await storage.createMessage({
            chatId: message.chatId,
            senderId: message.senderId,
            content: message.content,
          });

          // Get chat participants
          const chat = await storage.getChat(message.chatId);
          if (chat) {
            const otherUserId = chat.user1Id === message.senderId ? chat.user2Id : chat.user1Id;
            const otherClient = clients.get(otherUserId);
            if (otherClient && otherClient.readyState === WebSocket.OPEN) {
              otherClient.send(JSON.stringify({
                type: 'new_message',
                message: newMessage,
              }));
            }
          }
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  // API Routes

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Offer routes
  app.get("/api/offers", async (req, res) => {
    try {
      const { location, status, limit } = req.query;
      const offers = await storage.getOffers({
        location: location as string,
        status: status as string,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  app.get("/api/offers/:id", async (req, res) => {
    try {
      const offer = await storage.getOffer(req.params.id);
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      res.json(offer);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/offers", async (req, res) => {
    try {
      const result = insertOfferSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid offer data", errors: result.error.errors });
      }

      const offer = await storage.createOffer(result.data);
      res.status(201).json(offer);
    } catch (error) {
      res.status(500).json({ message: "Failed to create offer" });
    }
  });

  app.patch("/api/offers/:id", async (req, res) => {
    try {
      const offer = await storage.updateOffer(req.params.id, req.body);
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      res.json(offer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update offer" });
    }
  });

  // Join request routes
  app.post("/api/join-requests", async (req, res) => {
    try {
      const result = insertJoinRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid join request data", errors: result.error.errors });
      }

      const joinRequest = await storage.createJoinRequest(result.data);
      
      // Check if this creates a match (2 people interested)
      const allRequests = await storage.getJoinRequestsByOffer(result.data.offerId);
      const acceptedRequests = allRequests.filter(jr => jr.status === "accepted");
      
      if (acceptedRequests.length >= 1) {
        // Create a chat between the offer creator and the joiner
        const offer = await storage.getOffer(result.data.offerId);
        if (offer) {
          await storage.createChat({
            offerId: result.data.offerId,
            user1Id: offer.userId,
            user2Id: result.data.userId,
            lastMessage: null,
            lastMessageAt: null,
          });

          // Update offer status to matched
          await storage.updateOffer(result.data.offerId, {
            status: "matched",
            matchedUserId: result.data.userId,
          });
        }
      }

      res.status(201).json(joinRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to create join request" });
    }
  });

  app.get("/api/offers/:offerId/join-requests", async (req, res) => {
    try {
      const joinRequests = await storage.getJoinRequestsByOffer(req.params.offerId);
      res.json(joinRequests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch join requests" });
    }
  });

  // Chat routes
  app.get("/api/users/:userId/chats", async (req, res) => {
    try {
      const chats = await storage.getUserChats(req.params.userId);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  app.get("/api/chats/:chatId/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.chatId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/chats/:chatId/messages", async (req, res) => {
    try {
      const result = insertMessageSchema.safeParse({
        ...req.body,
        chatId: req.params.chatId,
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid message data", errors: result.error.errors });
      }

      const message = await storage.createMessage(result.data);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.post("/api/chats/:chatId/mark-read", async (req, res) => {
    try {
      const { userId } = req.body;
      await storage.markMessagesAsRead(req.params.chatId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  return httpServer;
}
