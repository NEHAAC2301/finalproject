import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  studentId: text("student_id").notNull().unique(),
  profileImage: text("profile_image"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  studentId: true,
  profileImage: true,
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  conversationId: text("conversation_id").notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  content: true,
  role: true,
  conversationId: true,
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(), // 'open', 'in_progress', 'resolved'
  department: text("department").notNull(),
  priority: text("priority").notNull(), // 'low', 'medium', 'high'
  assignedTo: text("assigned_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTicketSchema = createInsertSchema(tickets).pick({
  userId: true,
  subject: true,
  description: true,
  department: true,
  priority: true,
  assignedTo: true,
});

export const ticketUpdates = pgTable("ticket_updates", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => tickets.id),
  content: text("content").notNull(),
  creator: text("creator").notNull(), // Can be 'system', 'staff', or 'user'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTicketUpdateSchema = createInsertSchema(ticketUpdates).pick({
  ticketId: true,
  content: true,
  creator: true,
});

export const knowledgeBase = pgTable("knowledge_base", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  tags: text("tags").array().notNull(),
});

export const insertKnowledgeBaseSchema = createInsertSchema(knowledgeBase).pick({
  category: true,
  title: true,
  content: true,
  tags: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = z.infer<typeof insertTicketSchema>;

export type TicketUpdate = typeof ticketUpdates.$inferSelect;
export type InsertTicketUpdate = z.infer<typeof insertTicketUpdateSchema>;

export type KnowledgeBaseItem = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBaseItem = z.infer<typeof insertKnowledgeBaseSchema>;

// Enums
export const TicketStatus = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
} as const;

export const TicketPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const Departments = {
  ACADEMIC_AFFAIRS: 'Academic Affairs',
  IT_SUPPORT: 'IT Support',
  FINANCIAL_SERVICES: 'Financial Services',
  STUDENT_AFFAIRS: 'Student Affairs',
  FACILITIES_MANAGEMENT: 'Facilities Management',
  LIBRARY_SERVICES: 'Library Services',
  CAREER_SERVICES: 'Career Services',
  HEALTH_WELLNESS: 'Health and Wellness',
  HOUSING_SERVICES: 'Housing Services',
  OTHER: 'Other',
} as const;

export const MessageRole = {
  USER: 'user',
  ASSISTANT: 'assistant',
} as const;

export const TicketCreator = {
  SYSTEM: 'system',
  STAFF: 'staff',
  USER: 'user',
} as const;
