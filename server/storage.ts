import { type User, type InsertUser, type Offer, type InsertOffer, type JoinRequest, type InsertJoinRequest, type Chat, type Message, type InsertMessage, type Rating, type InsertRating, users, offers, joinRequests, chats, messages, ratings } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, and, or, not } from "drizzle-orm";

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

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values([insertUser]).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Offer operations
  async createOffer(insertOffer: InsertOffer): Promise<Offer> {
    const result = await db.insert(offers).values(insertOffer).returning();
    return result[0];
  }

  async getOffer(id: string): Promise<Offer | undefined> {
    const result = await db.select().from(offers).where(eq(offers.id, id));
    return result[0];
  }

  async getOffers(filters: { location?: string; status?: string; limit?: number } = {}): Promise<Offer[]> {
    let query = db.select().from(offers);
    
    if (filters.status) {
      query = query.where(eq(offers.status, filters.status));
    }
    
    query = query.orderBy(desc(offers.createdAt));
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    return await query;
  }

  async updateOffer(id: string, updates: Partial<Offer>): Promise<Offer | undefined> {
    const result = await db
      .update(offers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(offers.id, id))
      .returning();
    return result[0];
  }

  // Join request operations
  async createJoinRequest(insertJoinRequest: InsertJoinRequest): Promise<JoinRequest> {
    const result = await db.insert(joinRequests).values([insertJoinRequest]).returning();
    return result[0];
  }

  async getJoinRequestsByOffer(offerId: string): Promise<JoinRequest[]> {
    return await db.select().from(joinRequests).where(eq(joinRequests.offerId, offerId));
  }

  async updateJoinRequestStatus(id: string, status: string): Promise<JoinRequest | undefined> {
    const result = await db
      .update(joinRequests)
      .set({ status })
      .where(eq(joinRequests.id, id))
      .returning();
    return result[0];
  }

  // Chat operations
  async createChat(chatData: Omit<Chat, "id" | "createdAt">): Promise<Chat> {
    const result = await db.insert(chats).values([chatData]).returning();
    return result[0];
  }

  async getChat(id: string): Promise<Chat | undefined> {
    const result = await db.select().from(chats).where(eq(chats.id, id));
    return result[0];
  }

  async getUserChats(userId: string): Promise<Chat[]> {
    return await db
      .select()
      .from(chats)
      .where(or(eq(chats.user1Id, userId), eq(chats.user2Id, userId)));
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values([insertMessage]).returning();
    const message = result[0];

    // Update chat's last message
    await db
      .update(chats)
      .set({
        lastMessage: insertMessage.content,
        lastMessageAt: new Date(),
      })
      .where(eq(chats.id, insertMessage.chatId));

    return message;
  }

  async getChatMessages(chatId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.chatId, chatId),
          not(eq(messages.senderId, userId)),
          eq(messages.isRead, false)
        )
      );
  }

  // Rating operations
  async createRating(insertRating: InsertRating): Promise<Rating> {
    const result = await db.insert(ratings).values([insertRating]).returning();
    return result[0];
  }

  async getUserRatings(userId: string): Promise<Rating[]> {
    return await db.select().from(ratings).where(eq(ratings.ratedUserId, userId));
  }
}

export const storage = new DatabaseStorage();
