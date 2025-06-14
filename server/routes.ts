import dotenv from 'dotenv';
dotenv.config();
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPaymentSchema } from "@shared/schema";
import { z } from "zod";

const UPI_ID = "rekhadevi573710.rzp@icici";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all operators
  app.get("/api/operators", async (req, res) => {
    try {
      const operators = await storage.getOperators();
      res.json(operators);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch operators" });
    }
  });

  // Get operator by code
  app.get("/api/operators/:code", async (req, res) => {
    try {
      const operator = await storage.getOperatorByCode(req.params.code);
      if (!operator) {
        return res.status(404).json({ message: "Operator not found" });
      }
      res.json(operator);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch operator" });
    }
  });

  // Get all plans
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getPlans();
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  // Get plans by operator
  app.get("/api/plans/operator/:operatorId", async (req, res) => {
    try {
      const operatorId = parseInt(req.params.operatorId);
      if (isNaN(operatorId) || operatorId <= 0) {
        return res.status(400).json({ message: "Invalid operator ID" });
      }
      
      const plans = await storage.getPlansByOperator(operatorId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  // Get plan by ID
  app.get("/api/plans/:id", async (req, res) => {
    try {
      const planId = parseInt(req.params.id);
      if (isNaN(planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      const plan = await storage.getPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plan" });
    }
  });

  // Create payment
  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse({
        ...req.body,
        upiId: UPI_ID,
        status: 'pending'
      });

      // Verify plan exists
      const plan = await storage.getPlan(paymentData.planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // Verify amount matches plan discounted price
      if (paymentData.amount !== plan.discountedPrice) {
        return res.status(400).json({ message: "Amount does not match plan price" });
      }

      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid payment data",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Get payment by transaction ID
  app.get("/api/payments/:transactionId", async (req, res) => {
    try {
      const payment = await storage.getPaymentByTransactionId(req.params.transactionId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment" });
    }
  });

  // Update payment status
  app.patch("/api/payments/:transactionId/status", async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!['pending', 'success', 'failed'].includes(status)) {
        return res.status(400).json({ message: "Invalid payment status" });
      }

      const payment = await storage.getPaymentByTransactionId(req.params.transactionId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      const updatedPayment = await storage.updatePaymentStatus(
        payment.id, 
        status, 
        status === 'success' ? new Date() : undefined
      );
      
      res.json(updatedPayment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  // Generate UPI deep link
  app.post("/api/payments/:transactionId/upi-link", async (req, res) => {
    try {
      const payment = await storage.getPaymentByTransactionId(req.params.transactionId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      const plan = await storage.getPlan(payment.planId);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      const operator = await storage.getOperator(plan.operatorId);
      if (!operator) {
        return res.status(404).json({ message: "Operator not found" });
      }

      const transactionNote = `${operator.name.toUpperCase()} Recharge - ${plan.type} Plan - ₹${payment.amount}`;
      const upiLink = `upi://pay?pa=${UPI_ID}&pn=Mobile%20Recharge&am=${payment.amount}.00&cu=INR&tn=${encodeURIComponent(transactionNote)}&tr=${payment.transactionId}`;
      
      res.json({ upiLink, amount: payment.amount, operator: operator.name });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate UPI link" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
