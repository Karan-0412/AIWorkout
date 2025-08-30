import { type User, type InsertUser, type Offer, type InsertOffer, type JoinRequest, type InsertJoinRequest, type Chat, type Message, type InsertMessage, type Rating, type InsertRating } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Offer operations
  createOffer(offer: InsertOffer): Promise<Offer>;
  getOffer(id: string): Promise<Offer | undefined>;
  getOffers(filters?: { location?: string; status?: string; limit?: number }): Promise<Offer[]>;
  updateOffer(id: string, updates: Partial<Offer>): Promise<Offer | undefined>;

  // Join request operations
  createJoinRequest(joinRequest: InsertJoinRequest): Promise<JoinRequest>;
  getJoinRequestsByOffer(offerId: string): Promise<JoinRequest[]>;
  updateJoinRequestStatus(id: string, status: string): Promise<JoinRequest | undefined>;

  // Chat operations
  createChat(chat: Omit<Chat, "id" | "createdAt">): Promise<Chat>;
  getChat(id: string): Promise<Chat | undefined>;
  getUserChats(userId: string): Promise<Chat[]>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getChatMessages(chatId: string): Promise<Message[]>;
  markMessagesAsRead(chatId: string, userId: string): Promise<void>;

  // Rating operations
  createRating(rating: InsertRating): Promise<Rating>;
  getUserRatings(userId: string): Promise<Rating[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private offers: Map<string, Offer> = new Map();
  private joinRequests: Map<string, JoinRequest> = new Map();
  private chats: Map<string, Chat> = new Map();
  private messages: Map<string, Message> = new Map();
  private ratings: Map<string, Rating> = new Map();

  constructor() {
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample users
    const user1: User = {
      id: "user1",
      firebaseUid: "firebase1",
      email: "rahul@example.com",
      displayName: "Rahul Kumar",
      photoUrl: "https://images.unsplash.com/photo-1633332755192-727a05c4013d",
      phone: "+91-9876543210",
      rating: "4.8",
      totalRatings: "25",
      location: "Koramangala, Bangalore",
      deviceToken: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(user1.id, user1);

    // Sample offers
    const offer1: Offer = {
      id: "offer1",
      userId: user1.id,
      title: "Sony WH-1000XM4 Wireless Headphones",
      description: "Original price ₹24,999 - Looking for someone to split this amazing deal!",
      originalPrice: "24999",
      splitPrice: "12499",
      offerType: "buy1get1",
      productLink: "https://amazon.in/sony-headphones",
      images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df"],
      location: "Koramangala, Bangalore",
      latitude: "12.9352",
      longitude: "77.6245",
      status: "active",
      matchedUserId: null,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.offers.set(offer1.id, offer1);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUid === firebaseUid);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      rating: "0.00",
      totalRatings: "0",
      deviceToken: null,
      location: insertUser.location || null,
      photoUrl: insertUser.photoUrl || null,
      phone: insertUser.phone || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Offer operations
  async createOffer(insertOffer: InsertOffer): Promise<Offer> {
    const id = randomUUID();
    const offer: Offer = {
      ...insertOffer,
      id,
      description: insertOffer.description || null,
      productLink: insertOffer.productLink || null,
      latitude: insertOffer.latitude || null,
      longitude: insertOffer.longitude || null,
      status: "active",
      matchedUserId: null,
      expiresAt: insertOffer.expiresAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.offers.set(id, offer);
    return offer;
  }

  async getOffer(id: string): Promise<Offer | undefined> {
    return this.offers.get(id);
  }

  async getOffers(filters: { location?: string; status?: string; limit?: number } = {}): Promise<Offer[]> {
    let offers = Array.from(this.offers.values());

    if (filters.status) {
      offers = offers.filter(offer => offer.status === filters.status);
    }

    if (filters.location) {
      offers = offers.filter(offer => offer.location.includes(filters.location!));
    }

    // Sort by creation date (newest first)
    offers.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

    if (filters.limit) {
      offers = offers.slice(0, filters.limit);
    }

    return offers;
  }

  async updateOffer(id: string, updates: Partial<Offer>): Promise<Offer | undefined> {
    const offer = this.offers.get(id);
    if (!offer) return undefined;

    const updatedOffer = { ...offer, ...updates, updatedAt: new Date() };
    this.offers.set(id, updatedOffer);
    return updatedOffer;
  }

  // Join request operations
  async createJoinRequest(insertJoinRequest: InsertJoinRequest): Promise<JoinRequest> {
    const id = randomUUID();
    const joinRequest: JoinRequest = {
      ...insertJoinRequest,
      id,
      message: insertJoinRequest.message || null,
      status: "pending",
      createdAt: new Date(),
    };
    this.joinRequests.set(id, joinRequest);
    return joinRequest;
  }

  async getJoinRequestsByOffer(offerId: string): Promise<JoinRequest[]> {
    return Array.from(this.joinRequests.values()).filter(jr => jr.offerId === offerId);
  }

  async updateJoinRequestStatus(id: string, status: string): Promise<JoinRequest | undefined> {
    const joinRequest = this.joinRequests.get(id);
    if (!joinRequest) return undefined;

    const updatedJoinRequest = { ...joinRequest, status };
    this.joinRequests.set(id, updatedJoinRequest);
    return updatedJoinRequest;
  }

  // Chat operations
  async createChat(chatData: Omit<Chat, "id" | "createdAt">): Promise<Chat> {
    const id = randomUUID();
    const chat: Chat = {
      ...chatData,
      id,
      createdAt: new Date(),
    };
    this.chats.set(id, chat);
    return chat;
  }

  async getChat(id: string): Promise<Chat | undefined> {
    return this.chats.get(id);
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    return Array.from(this.chats.values()).filter(
      chat => chat.user1Id === userId || chat.user2Id === userId
    );
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      messageType: insertMessage.messageType || "text",
      isRead: false,
      createdAt: new Date(),
    };
    this.messages.set(id, message);

    // Update chat's last message
    const chat = this.chats.get(insertMessage.chatId);
    if (chat) {
      const updatedChat = {
        ...chat,
        lastMessage: insertMessage.content,
        lastMessageAt: new Date(),
      };
      this.chats.set(insertMessage.chatId, updatedChat);
    }

    return message;
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.chatId === chatId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    for (const [id, message] of Array.from(this.messages.entries())) {
      if (message.chatId === chatId && message.senderId !== userId && !message.isRead) {
        this.messages.set(id, { ...message, isRead: true });
      }
    }
  }

  // Rating operations
  async createRating(insertRating: InsertRating): Promise<Rating> {
    const id = randomUUID();
    const rating: Rating = {
      ...insertRating,
      id,
      comment: insertRating.comment || null,
      createdAt: new Date(),
    };
    this.ratings.set(id, rating);
    return rating;
  }

  async getUserRatings(userId: string): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(rating => rating.ratedUserId === userId);
  }
}

export const storage = new MemStorage();
