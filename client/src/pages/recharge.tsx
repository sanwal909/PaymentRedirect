import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Phone, Zap, Timer, ArrowRight, CheckCircle } from 'lucide-react';
import { CountdownTimer } from '@/components/countdown-timer';
import { PaymentModal } from '@/components/payment-modal';
import { SuccessModal } from '@/components/success-modal';
import { ErrorModal } from '@/components/error-modal';
import { useUPIPayment } from '@/hooks/use-upi-payment';
import { useToast } from '@/hooks/use-toast';
import type { Operator, RechargePlan } from '@/types/recharge';

export default function Recharge() {
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<RechargePlan | null>(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const { toast } = useToast();
  const { processPayment, updatePaymentStatus, isProcessing } = useUPIPayment();

  // Fetch operators
  const { data: operators = [], isLoading: loadingOperators } = useQuery<Operator[]>({
    queryKey: ['/api/operators'],
  });

  // Fetch plans for selected operator
  const { data: plans = [], isLoading: loadingPlans } = useQuery<RechargePlan[]>({
    queryKey: [`/api/plans/operator/${selectedOperator?.id}`],
    enabled: !!selectedOperator?.id,
  });

  const handleOperatorSelect = (operator: Operator) => {
    setSelectedOperator(operator);
    setSelectedPlan(null);
  };

  const handlePlanSelect = (plan: RechargePlan) => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      toast({
        title: "Mobile Number Required",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    try {
      const result = await processPayment({
        planId: selectedPlan.id,
        amount: selectedPlan.discountedPrice,
        mobileNumber,
      });

      if (result.success && result.payment) {
        setShowPaymentModal(false);
        
        // Simulate payment verification
        setTimeout(async () => {
          try {
            const success = Math.random() > 0.1; // 90% success rate
            
            await updatePaymentStatus(
              result.payment!.transactionId, 
              success ? 'success' : 'failed'
            );
            
            if (success) {
              setShowSuccessModal(true);
              toast({
                title: "Recharge Successful!",
                description: `₹${selectedPlan.discountedPrice} recharge completed for ${mobileNumber}`,
              });
            } else {
              setShowErrorModal(true);
            }
          } catch (error) {
            setShowErrorModal(true);
          }
        }, 3000);
      } else {
        setShowErrorModal(true);
      }
    } catch (error) {
      setShowErrorModal(true);
    }
  };

  const closeAllModals = () => {
    setShowPaymentModal(false);
    setShowSuccessModal(false);
    setShowErrorModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-purple-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  QuickRecharge 2025
                </h1>
                <p className="text-sm text-gray-600">Lightning Fast • Super Secure</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                100% Secure UPI
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Countdown Timer */}
      <CountdownTimer />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Panel - Mobile Number & Operators */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Mobile Number Input */}
            <Card className="shadow-xl bg-white/90 backdrop-blur-md border-0">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Phone className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Enter Mobile Number</h3>
                </div>
                <Input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="text-lg py-3 border-2 border-purple-100 focus:border-purple-500 rounded-xl"
                  maxLength={10}
                />
                <p className="text-xs text-gray-500 mt-2">We'll send confirmation SMS to this number</p>
              </CardContent>
            </Card>

            {/* Operator Selection */}
            <Card className="shadow-xl bg-white/90 backdrop-blur-md border-0">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Operator</h3>
                {loadingOperators ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="bg-gray-200 rounded-xl p-4 animate-pulse h-16" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {operators.map((operator) => (
                      <div
                        key={operator.id}
                        onClick={() => handleOperatorSelect(operator)}
                        className={`flex items-center p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                          selectedOperator?.id === operator.id
                            ? 'bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 shadow-md'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <img 
                          src={operator.logoUrl || ''} 
                          alt={operator.name}
                          className="w-12 h-6 object-contain mr-4"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{operator.name}</h4>
                          <p className="text-xs text-gray-500">
                            {operator.name === 'Jio' && "4G Leader"}
                            {operator.name === 'Airtel' && "Fastest Network"}
                            {operator.name === 'Vi' && "Strong Coverage"}
                            {operator.name === 'BSNL' && "Pan India"}
                          </p>
                        </div>
                        {selectedOperator?.id === operator.id && (
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Plans */}
          <div className="lg:col-span-2">
            {selectedOperator ? (
              <Card className="shadow-xl bg-white/90 backdrop-blur-md border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Zap className="w-6 h-6 text-purple-600 mr-2" />
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedOperator.name} Plans
                      </h3>
                    </div>
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg px-4 py-2">
                      83% OFF
                    </Badge>
                  </div>

                  {loadingPlans ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-gray-200 rounded-xl p-6 animate-pulse h-32" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {plans.map((plan) => {
                        const discount = plan.originalPrice - plan.discountedPrice;
                        const discountPercentage = Math.round((discount / plan.originalPrice) * 100);
                        
                        return (
                          <div
                            key={plan.id}
                            className="bg-gradient-to-r from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-purple-200 transition-all duration-300 p-6 hover:shadow-lg"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-lg font-bold text-gray-900">{plan.type} Plan</h4>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                  <span>📶 {plan.data}</span>
                                  <span>📞 {plan.calls}</span>
                                  <span>⏰ {plan.validity}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center space-x-2">
                                  <span className="text-2xl font-bold text-green-600">₹{plan.discountedPrice}</span>
                                  <span className="text-lg text-gray-500 line-through">₹{plan.originalPrice}</span>
                                </div>
                                <div className="text-sm text-green-600 font-semibold">
                                  Save ₹{discount} ({discountPercentage}% OFF)
                                </div>
                              </div>
                            </div>
                            
                            <Button 
                              onClick={() => handlePlanSelect(plan)}
                              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Timer className="w-5 h-5 mr-2" />
                              Recharge Now
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-xl bg-white/90 backdrop-blur-md border-0 h-96">
                <CardContent className="p-6 h-full flex items-center justify-center">
                  <div className="text-center">
                    <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Select Your Operator</h3>
                    <p className="text-gray-500">Choose your mobile network operator to view available plans</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Promotional Banner */}
        <Card className="mt-8 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white overflow-hidden shadow-2xl">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-3">🎉 Mega Recharge Festival 2025</h3>
                <p className="text-lg opacity-90 mb-4">
                  Experience lightning-fast recharges with our secure UPI payment system
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Instant Activation</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>100% Secure</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1556742111-a301076d9d18?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250" 
                  alt="Mobile Recharge" 
                  className="w-full max-w-sm mx-auto rounded-2xl shadow-lg"
                />
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