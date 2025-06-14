import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { nanoid } from 'nanoid';
import type { Payment, UPILinkResponse } from '@/types/recharge';

export function useUPIPayment() {
  const [isProcessing, setIsProcessing] = useState(false);

  const createPaymentMutation = useMutation({
    mutationFn: async (data: {
      planId: number;
      amount: number;
      mobileNumber?: string;
    }) => {
      const response = await apiRequest('POST', '/api/payments', {
        ...data,
        transactionId: `TXN${nanoid(10).toUpperCase()}`,
      });
      return response.json() as Promise<Payment>;
    },
  });

  const generateUPILinkMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await apiRequest('POST', `/api/payments/${transactionId}/upi-link`);
      return response.json() as Promise<UPILinkResponse>;
    },
  });

  const updatePaymentStatusMutation = useMutation({
    mutationFn: async (data: { transactionId: string; status: string }) => {
      const response = await apiRequest('PATCH', `/api/payments/${data.transactionId}/status`, {
        status: data.status,
      });
      return response.json() as Promise<Payment>;
    },
  });

  const processPayment = async (data: {
    planId: number;
    amount: number;
    mobileNumber?: string;
  }) => {
    setIsProcessing(true);
    
    try {
      // Create payment record
      const payment = await createPaymentMutation.mutateAsync(data);
      
      // Generate UPI link
      const upiData = await generateUPILinkMutation.mutateAsync(payment.transactionId);
      
      // Open UPI link with proper mobile detection
      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Mobile device - directly open UPI link
        window.location.href = upiData.upiLink;
      } else {
        // Desktop - create temporary link and click
        const link = document.createElement('a');
        link.href = upiData.upiLink;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      return {
        payment,
        upiData,
        success: true,
      };
    } catch (error) {
      console.error('Payment processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const updatePaymentStatus = async (transactionId: string, status: string) => {
    try {
      return await updatePaymentStatusMutation.mutateAsync({ transactionId, status });
    } catch (error) {
      console.error('Failed to update payment status:', error);
      throw error;
    }
  };

  return {
    processPayment,
    updatePaymentStatus,
    isProcessing,
    isCreatingPayment: createPaymentMutation.isPending,
    isGeneratingLink: generateUPILinkMutation.isPending,
    isUpdatingStatus: updatePaymentStatusMutation.isPending,
  };
}
