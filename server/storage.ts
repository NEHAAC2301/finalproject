import {
  type User, 
  type InsertUser, 
  type Message, 
  type InsertMessage, 
  type Ticket, 
  type InsertTicket, 
  type TicketUpdate, 
  type InsertTicketUpdate,
  type KnowledgeBaseItem,
  type InsertKnowledgeBaseItem,
  TicketStatus
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getMessagesByUserId(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getTicketsByUserId(userId: number): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  getTicketUpdates(ticketId: number): Promise<TicketUpdate[]>;
  createTicketUpdate(update: InsertTicketUpdate): Promise<TicketUpdate>;
  getAllKnowledgeBaseItems(): Promise<KnowledgeBaseItem[]>;
  getKnowledgeBaseItemsByCategory(category: string): Promise<KnowledgeBaseItem[]>;
  createKnowledgeBaseItem(item: InsertKnowledgeBaseItem): Promise<KnowledgeBaseItem>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: any[] = [];
  private messages: any[] = [];
  private tickets: any[] = [];
  private ticketUpdates: any[] = [];
  private knowledgeBase: any[] = [];
  
  private nextUserId = 1;
  private nextMessageId = 1;
  private nextTicketId = 1;
  private nextTicketUpdateId = 1;
  private nextKnowledgeBaseItemId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id) as User | undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username) as User | undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = {
      ...user,
      id: this.nextUserId++,
      profileImage: user.profileImage || null
    };
    this.users.push(newUser);
    return newUser as User;
  }
  
  async getMessagesByUserId(userId: number): Promise<Message[]> {
    return this.messages
      .filter(message => message.userId === userId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()) as Message[];
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const newMessage = {
      ...message,
      id: this.nextMessageId++,
      timestamp: new Date()
    };
    this.messages.push(newMessage);
    return newMessage as Message;
  }
  
  async getTicketsByUserId(userId: number): Promise<Ticket[]> {
    return this.tickets
      .filter(ticket => ticket.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) as Ticket[];
  }
  
  async getTicket(id: number): Promise<Ticket | undefined> {
    return this.tickets.find(ticket => ticket.id === id) as Ticket | undefined;
  }
  
  async createTicket(ticket: InsertTicket): Promise<Ticket> {
    const now = new Date();
    const newTicket = {
      ...ticket,
      id: this.nextTicketId++,
      ticketNumber: `T-${Math.floor(1000 + Math.random() * 9000)}`,
      status: TicketStatus.OPEN,
      assignedTo: ticket.assignedTo || null,
      createdAt: now,
      updatedAt: now
    };
    this.tickets.push(newTicket);
    return newTicket as Ticket;
  }
  
  async getTicketUpdates(ticketId: number): Promise<TicketUpdate[]> {
    return this.ticketUpdates
      .filter(update => update.ticketId === ticketId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) as TicketUpdate[];
  }
  
  async createTicketUpdate(update: InsertTicketUpdate): Promise<TicketUpdate> {
    const now = new Date();
    const newUpdate = {
      ...update,
      id: this.nextTicketUpdateId++,
      createdAt: now
    };
    this.ticketUpdates.push(newUpdate);
    
    // Update the ticket's updatedAt timestamp
    const ticket = this.tickets.find(t => t.id === update.ticketId);
    if (ticket) {
      ticket.updatedAt = now;
    }
    
    return newUpdate as TicketUpdate;
  }
  
  async getAllKnowledgeBaseItems(): Promise<KnowledgeBaseItem[]> {
    return [...this.knowledgeBase] as KnowledgeBaseItem[];
  }
  
  async getKnowledgeBaseItemsByCategory(category: string): Promise<KnowledgeBaseItem[]> {
    return this.knowledgeBase
      .filter(item => item.category.toLowerCase() === category.toLowerCase()) as KnowledgeBaseItem[];
  }
  
  async createKnowledgeBaseItem(item: InsertKnowledgeBaseItem): Promise<KnowledgeBaseItem> {
    const newItem = {
      ...item,
      id: this.nextKnowledgeBaseItemId++
    };
    this.knowledgeBase.push(newItem);
    return newItem as KnowledgeBaseItem;
  }
}

export const storage = new MemStorage();
