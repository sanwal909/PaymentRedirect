import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const operators = pgTable("operators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  brandColor: text("brand_color").notNull(),
  logoUrl: text("logo_url"),
});

export const rechargePlans = pgTable("recharge_plans", {
  id: serial("id").primaryKey(),
  operatorId: integer("operator_id").notNull(),
  originalPrice: integer("original_price").notNull(),
  discountedPrice: integer("discounted_price").notNull(),
  data: text("data").notNull(),
  validity: text("validity").notNull(),
  calls: text("calls").notNull(),
  type: text("type").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  planId: integer("plan_id").notNull(),
  amount: integer("amount").notNull(),
  upiId: text("upi_id").notNull(),
  status: text("status").notNull(), // 'pending', 'success', 'failed'
  mobileNumber: text("mobile_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertOperatorSchema = createInsertSchema(operators).omit({
  id: true,
});

export const insertRechargePlanSchema = createInsertSchema(rechargePlans).omit({
  id: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export type Operator = typeof operators.$inferSelect;
export type RechargePlan = typeof rechargePlans.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type InsertOperator = z.infer<typeof insertOperatorSchema>;
export type InsertRechargePlan = z.infer<typeof insertRechargePlanSchema>;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
