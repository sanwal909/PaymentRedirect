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
      
      // Try to open specific UPI apps with fallback
      const tryUPIApps = () => {
        const upiLink = upiData.upiLink;
        const apps = [
          { name: 'Google Pay', scheme: `gpay://upi/pay?${upiLink.split('?')[1]}` },
          { name: 'PhonePe', scheme: `phonepe://pay?${upiLink.split('?')[1]}` },
          { name: 'Paytm', scheme: `paytmmp://pay?${upiLink.split('?')[1]}` },
          { name: 'BHIM', scheme: `bhim://pay?${upiLink.split('?')[1]}` },
          { name: 'Amazon Pay', scheme: `amazonpay://pay?${upiLink.split('?')[1]}` }
        ];

        // Try each app with timeout
        let attempted = 0;
        const tryNextApp = () => {
          if (attempted < apps.length) {
            const app = apps[attempted];
            attempted++;
            
            // Create iframe to try opening the app
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = app.scheme;
            document.body.appendChild(iframe);
            
            setTimeout(() => {
              document.body.removeChild(iframe);
              // If we're still here after 1 second, try next app
              tryNextApp();
            }, 1000);
          } else {
            // Fallback to standard UPI link
            window.location.href = upiLink;
          }
        };

        tryNextApp();
      };

      if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Mobile device - try specific apps first
        tryUPIApps();
      } else {
        // Desktop - open UPI link directly
        window.open(upiData.upiLink, '_blank');
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
