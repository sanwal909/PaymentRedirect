export interface Operator {
  id: number;
  name: string;
  code: string;
  brandColor: string;
  logoUrl?: string;
}

export interface RechargePlan {
  id: number;
  operatorId: number;
  originalPrice: number;
  discountedPrice: number;
  data: string;
  validity: string;
  calls: string;
  type: string;
  isActive: boolean;
}

export interface Payment {
  id: number;
  transactionId: string;
  planId: number;
  amount: number;
  upiId: string;
  status: 'pending' | 'success' | 'failed';
  mobileNumber?: string;
  createdAt: string;
  completedAt?: string;
}

export interface UPILinkResponse {
  upiLink: string;
  amount: number;
  operator: string;
}

export interface PlanWithOperator extends RechargePlan {
  operator: Operator;
}
