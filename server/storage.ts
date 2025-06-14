import { 
  operators, 
  rechargePlans, 
  payments,
  type Operator, 
  type RechargePlan, 
  type Payment,
  type InsertOperator,
  type InsertRechargePlan,
  type InsertPayment
} from "@shared/schema";

export interface IStorage {
  // Operators
  getOperators(): Promise<Operator[]>;
  getOperator(id: number): Promise<Operator | undefined>;
  getOperatorByCode(code: string): Promise<Operator | undefined>;
  createOperator(operator: InsertOperator): Promise<Operator>;

  // Recharge Plans
  getPlans(): Promise<RechargePlan[]>;
  getPlansByOperator(operatorId: number): Promise<RechargePlan[]>;
  getPlan(id: number): Promise<RechargePlan | undefined>;
  createPlan(plan: InsertRechargePlan): Promise<RechargePlan>;

  // Payments
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentByTransactionId(transactionId: string): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string, completedAt?: Date): Promise<Payment | undefined>;
}

export class MemStorage implements IStorage {
  private operators: Map<number, Operator>;
  private rechargePlans: Map<number, RechargePlan>;
  private payments: Map<number, Payment>;
  private currentOperatorId: number;
  private currentPlanId: number;
  private currentPaymentId: number;

  constructor() {
    this.operators = new Map();
    this.rechargePlans = new Map();
    this.payments = new Map();
    this.currentOperatorId = 1;
    this.currentPlanId = 1;
    this.currentPaymentId = 1;

    // Initialize with current 2025 telecom operators
    this.initializeOperators();
    this.initializePlans();
  }

  private initializeOperators() {
    const operatorData: InsertOperator[] = [
      {
        name: "Jio",
        code: "jio",
        brandColor: "#FF6B35",
        logoUrl: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=60"
      },
      {
        name: "Airtel",
        code: "airtel", 
        brandColor: "#E60012",
        logoUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=60"
      },
      {
        name: "Vi",
        code: "vi",
        brandColor: "#000000", 
        logoUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=60"
      },
      {
        name: "BSNL",
        code: "bsnl",
        brandColor: "#FFD700",
        logoUrl: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=60"
      }
    ];

    operatorData.forEach(op => this.createOperator(op));
  }

  private initializePlans() {
    // Current 2025 plans with real market rates (₹200+ only)
    const planData = [
      // Jio Plans
      { operatorId: 1, originalPrice: 999, data: '2GB/day', validity: '84 days', calls: 'Unlimited', type: 'Popular' },
      { operatorId: 1, originalPrice: 666, data: '1.5GB/day', validity: '84 days', calls: 'Unlimited', type: 'Value' },
      { operatorId: 1, originalPrice: 395, data: '6GB total', validity: '28 days', calls: 'Unlimited', type: 'Basic' },
      { operatorId: 1, originalPrice: 2999, data: '2.5GB/day', validity: '365 days', calls: 'Unlimited', type: 'Annual' },
      { operatorId: 1, originalPrice: 719, data: '1.5GB/day', validity: '84 days', calls: 'Unlimited', type: 'Special' },

      // Airtel Plans
      { operatorId: 2, originalPrice: 1199, data: '2GB/day', validity: '84 days', calls: 'Unlimited', type: 'Popular' },
      { operatorId: 2, originalPrice: 719, data: '1.5GB/day', validity: '84 days', calls: 'Unlimited', type: 'Value' },
      { operatorId: 2, originalPrice: 449, data: '3GB total', validity: '28 days', calls: 'Unlimited', type: 'Basic' },
      { operatorId: 2, originalPrice: 3359, data: '2.5GB/day', validity: '365 days', calls: 'Unlimited', type: 'Annual' },
      { operatorId: 2, originalPrice: 839, data: '2GB/day', validity: '56 days', calls: 'Unlimited', type: 'Special' },

      // Vi Plans
      { operatorId: 3, originalPrice: 999, data: '1.5GB/day', validity: '84 days', calls: 'Unlimited', type: 'Popular' },
      { operatorId: 3, originalPrice: 666, data: '1GB/day', validity: '84 days', calls: 'Unlimited', type: 'Value' },
      { operatorId: 3, originalPrice: 379, data: '6GB total', validity: '28 days', calls: 'Unlimited', type: 'Basic' },
      { operatorId: 3, originalPrice: 3499, data: '2GB/day', validity: '365 days', calls: 'Unlimited', type: 'Annual' },
      { operatorId: 3, originalPrice: 699, data: '1.5GB/day', validity: '70 days', calls: 'Unlimited', type: 'Special' },

      // BSNL Plans
      { operatorId: 4, originalPrice: 797, data: '2GB/day', validity: '84 days', calls: 'Unlimited', type: 'Popular' },
      { operatorId: 4, originalPrice: 599, data: '1GB/day', validity: '84 days', calls: 'Unlimited', type: 'Value' },
      { operatorId: 4, originalPrice: 349, data: '3GB total', validity: '28 days', calls: 'Unlimited', type: 'Basic' },
      { operatorId: 4, originalPrice: 2399, data: '2GB/day', validity: '365 days', calls: 'Unlimited', type: 'Annual' },
      { operatorId: 4, originalPrice: 697, data: '1.5GB/day', validity: '74 days', calls: 'Unlimited', type: 'Special' },
    ];

    planData.forEach(plan => {
      const discountedPrice = Math.round(plan.originalPrice * 0.17); // 83% off
      this.createPlan({
        ...plan,
        discountedPrice,
        isActive: true
      });
    });
  }

  // Operator methods
  async getOperators(): Promise<Operator[]> {
    return Array.from(this.operators.values());
  }

  async getOperator(id: number): Promise<Operator | undefined> {
    return this.operators.get(id);
  }

  async getOperatorByCode(code: string): Promise<Operator | undefined> {
    return Array.from(this.operators.values()).find(op => op.code === code);
  }

  async createOperator(insertOperator: InsertOperator): Promise<Operator> {
    const id = this.currentOperatorId++;
    const operator: Operator = { ...insertOperator, id };
    this.operators.set(id, operator);
    return operator;
  }

  // Recharge Plan methods
  async getPlans(): Promise<RechargePlan[]> {
    return Array.from(this.rechargePlans.values());
  }

  async getPlansByOperator(operatorId: number): Promise<RechargePlan[]> {
    return Array.from(this.rechargePlans.values()).filter(plan => 
      plan.operatorId === operatorId && plan.isActive
    );
  }

  async getPlan(id: number): Promise<RechargePlan | undefined> {
    return this.rechargePlans.get(id);
  }

  async createPlan(insertPlan: InsertRechargePlan): Promise<RechargePlan> {
    const id = this.currentPlanId++;
    const plan: RechargePlan = { ...insertPlan, id };
    this.rechargePlans.set(id, plan);
    return plan;
  }

  // Payment methods
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentByTransactionId(transactionId: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(payment => 
      payment.transactionId === transactionId
    );
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const payment: Payment = {
      ...insertPayment,
      id,
      createdAt: new Date(),
      completedAt: null
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePaymentStatus(id: number, status: string, completedAt?: Date): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;

    const updatedPayment: Payment = {
      ...payment,
      status,
      completedAt: completedAt || (status === 'success' ? new Date() : null)
    };
    
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
}

export const storage = new MemStorage();
