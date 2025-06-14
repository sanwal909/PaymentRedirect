import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone } from 'lucide-react';
import { CountdownTimer } from '@/components/countdown-timer';
import { OperatorCard } from '@/components/operator-card';
import { PlanCard } from '@/components/plan-card';
import { PaymentModal } from '@/components/payment-modal';
import { SuccessModal } from '@/components/success-modal';
import { ErrorModal } from '@/components/error-modal';
import { useUPIPayment } from '@/hooks/use-upi-payment';
import { useToast } from '@/hooks/use-toast';
import type { Operator, RechargePlan } from '@/types/recharge';

export default function Home() {
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<RechargePlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);

  const { toast } = useToast();
  const { processPayment, updatePaymentStatus, isProcessing } = useUPIPayment();
  const queryClient = useQueryClient();

  // Fetch operators
  const { data: operators = [], isLoading: loadingOperators } = useQuery<Operator[]>({
    queryKey: ['/api/operators'],
  });

  // Fetch plans for selected operator
  const { data: plans = [], isLoading: loadingPlans } = useQuery<RechargePlan[]>({
    queryKey: ['/api/plans/operator', selectedOperator?.id],
    enabled: !!selectedOperator?.id,
  });

  // Handle operator selection
  const handleOperatorSelect = (operator: Operator) => {
    setSelectedOperator(operator);
    setSelectedPlan(null);
    // Scroll to plans section after a brief delay
    setTimeout(() => {
      const plansSection = document.getElementById('plans-section');
      plansSection?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handle plan selection
  const handlePlanSelect = (plan: RechargePlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  // Handle payment processing
  const handlePayment = async () => {
    if (!selectedPlan) return;

    try {
      const result = await processPayment({
        planId: selectedPlan.id,
        amount: selectedPlan.discountedPrice,
      });

      if (result.success && result.payment) {
        setCurrentPaymentId(result.payment.transactionId);
        setShowPaymentModal(false);
        
        // Simulate payment verification after UPI app interaction
        setTimeout(async () => {
          try {
            // In a real app, this would be triggered by payment gateway callback
            const success = Math.random() > 0.1; // 90% success rate for demo
            
            await updatePaymentStatus(
              result.payment!.transactionId, 
              success ? 'success' : 'failed'
            );
            
            if (success) {
              setShowSuccessModal(true);
              toast({
                title: "Payment Successful!",
                description: "Your mobile has been recharged successfully.",
              });
            } else {
              setShowErrorModal(true);
              toast({
                title: "Payment Failed",
                description: "Please try again or contact support.",
                variant: "destructive",
              });
            }
          } catch (error) {
            setShowErrorModal(true);
            toast({
              title: "Payment Status Update Failed",
              description: "Please contact support if money was deducted.",
              variant: "destructive",
            });
          }
        }, 3000);
      } else {
        setShowErrorModal(true);
        toast({
          title: "Payment Processing Failed",
          description: result.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setShowErrorModal(true);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Close all modals
  const closeAllModals = () => {
    setShowPaymentModal(false);
    setShowSuccessModal(false);
    setShowErrorModal(false);
    setCurrentPaymentId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Mobile Recharge</h1>
                <p className="text-xs text-gray-500">Lightning Fast Payments</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Secure by</div>
              <div className="text-sm font-semibold text-primary">UPI</div>
            </div>
          </div>
        </div>
      </header>

      {/* Countdown Timer */}
      <CountdownTimer />

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Operator Selection */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Choose Your Operator</h2>
          {loadingOperators ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 rounded-2xl p-4 animate-pulse h-24" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {operators.map((operator) => (
                <OperatorCard
                  key={operator.id}
                  operator={operator}
                  isSelected={selectedOperator?.id === operator.id}
                  onClick={() => handleOperatorSelect(operator)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Plans Section */}
        {selectedOperator && (
          <div id="plans-section" className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Popular Plans</h2>
              <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white">
                83% OFF
              </Badge>
            </div>

            {loadingPlans ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-200 rounded-2xl p-5 animate-pulse h-32" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    operator={selectedOperator}
                    onSelect={() => handlePlanSelect(plan)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Promotional Banner */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white mb-6 mt-8 overflow-hidden">
          <CardContent className="p-6">
            <img 
              src="https://images.unsplash.com/photo-1556742111-a301076d9d18?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200" 
              alt="Mobile Recharge Offer" 
              className="w-full h-32 object-cover rounded-xl mb-4"
            />
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">🎉 Mega Recharge Festival</h3>
              <p className="text-sm opacity-90 mb-3">Get cashback up to ₹100 on every recharge!</p>
              <div className="flex items-center justify-center space-x-4 text-xs">
                <div className="flex items-center">
                  <span className="mr-1">🛡️</span>
                  <span>100% Secure</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-1">⚡</span>
                  <span>Instant Recharge</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        plan={selectedPlan}
        operator={selectedOperator}
        onPayment={handlePayment}
        isProcessing={isProcessing}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={closeAllModals}
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={closeAllModals}
        onRetry={() => {
          setShowErrorModal(false);
          setShowPaymentModal(true);
        }}
      />
    </div>
  );
}
