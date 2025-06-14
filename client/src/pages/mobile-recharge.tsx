import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Phone, 
  Zap, 
  Timer, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Gift,
  Shield,
  Clock
} from 'lucide-react';
import { CountdownTimer } from '@/components/countdown-timer';
import { useUPIPayment } from '@/hooks/use-upi-payment';
import { useToast } from '@/hooks/use-toast';
import type { Operator, RechargePlan } from '@/types/recharge';

export default function MobileRecharge() {
  const [step, setStep] = useState(1); // 1: Mobile, 2: Operator, 3: Plan, 4: Payment
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<RechargePlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();
  const { processPayment, updatePaymentStatus } = useUPIPayment();

  // Fetch operators
  const { data: operators = [] } = useQuery<Operator[]>({
    queryKey: ['/api/operators'],
  });

  // Fetch plans for selected operator
  const { data: plans = [] } = useQuery<RechargePlan[]>({
    queryKey: [`/api/plans/operator/${selectedOperator?.id}`],
    enabled: !!selectedOperator?.id,
  });

  const handleMobileSubmit = () => {
    if (mobileNumber.length === 10) {
      setStep(2);
    } else {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
    }
  };

  const handleOperatorSelect = (operator: Operator) => {
    setSelectedOperator(operator);
    setStep(3);
  };

  const handlePlanSelect = (plan: RechargePlan) => {
    setSelectedPlan(plan);
    setStep(4);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    setIsProcessing(true);
    try {
      const result = await processPayment({
        planId: selectedPlan.id,
        amount: selectedPlan.discountedPrice,
        mobileNumber,
      });

      if (result.success) {
        toast({
          title: "Payment Initiated",
          description: "Complete payment in your UPI app",
        });

        // Simulate payment completion
        setTimeout(async () => {
          try {
            const success = Math.random() > 0.1;
            
            if (result.payment) {
              await updatePaymentStatus(result.payment.transactionId, success ? 'success' : 'failed');
            }
            
            if (success) {
              toast({
                title: "Recharge Successful!",
                description: `₹${selectedPlan.discountedPrice} recharged to ${mobileNumber}`,
              });
              // Reset to start
              setTimeout(() => {
                setStep(1);
                setMobileNumber('');
                setSelectedOperator(null);
                setSelectedPlan(null);
              }, 3000);
            } else {
              toast({
                title: "Payment Failed",
                description: "Please try again",
                variant: "destructive",
              });
              setStep(3); // Go back to plan selection
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "Please contact support",
              variant: "destructive",
            });
          }
          setIsProcessing(false);
        }, 3000);
      } else {
        throw new Error('Payment failed');
      }
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Payment Error",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  QuickRecharge 2025
                </h1>
                <p className="text-xs text-gray-600">Instant • Secure • Reliable</p>
              </div>
            </div>
            <Badge className="bg-green-500 text-white">100% Safe</Badge>
          </div>
        </div>
      </header>

      <CountdownTimer />

      {/* Progress Steps */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step >= stepNum 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {stepNum}
              </div>
              {stepNum < 4 && (
                <div className={`w-12 h-1 mx-2 ${
                  step > stepNum ? 'bg-purple-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Mobile Number */}
        {step === 1 && (
          <Card className="shadow-2xl bg-white/95 backdrop-blur-md border-0">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter Mobile Number</h2>
              <p className="text-gray-600 mb-6">Start your instant recharge journey</p>
              
              <div className="max-w-sm mx-auto space-y-4">
                <Input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="text-center text-xl py-4 border-2 border-purple-200 focus:border-purple-500 rounded-xl"
                  maxLength={10}
                />
                <Button 
                  onClick={handleMobileSubmit}
                  disabled={mobileNumber.length !== 10}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-4 rounded-xl font-semibold text-lg"
                >
                  Continue <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Operator Selection */}
        {step === 2 && (
          <Card className="shadow-2xl bg-white/95 backdrop-blur-md border-0">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Network</h2>
                <p className="text-gray-600">Select your mobile operator for {mobileNumber}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                {operators.map((operator) => (
                  <div
                    key={operator.id}
                    onClick={() => handleOperatorSelect(operator)}
                    className="p-6 rounded-2xl border-2 border-gray-100 hover:border-purple-300 cursor-pointer transition-all duration-300 hover:shadow-lg bg-white"
                  >
                    <div className="text-center">
                      <img 
                        src={operator.logoUrl || ''} 
                        alt={operator.name}
                        className="w-16 h-8 object-contain mx-auto mb-3"
                      />
                      <h3 className="font-bold text-gray-900 text-lg">{operator.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {operator.name === 'Jio' && "4G Leader • Premium"}
                        {operator.name === 'Airtel' && "Fastest Network"}
                        {operator.name === 'Vi' && "Strong Coverage"}
                        {operator.name === 'BSNL' && "Government Network"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={goBack}
                variant="outline"
                className="w-full py-3 rounded-xl"
              >
                Back to Mobile Number
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Plan Selection */}
        {step === 3 && selectedOperator && (
          <Card className="shadow-2xl bg-white/95 backdrop-blur-md border-0">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedOperator.name} Plans
                </h2>
                <p className="text-gray-600">Choose the perfect plan for {mobileNumber}</p>
                <Badge className="mt-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg px-4 py-2">
                  🔥 83% OFF - Limited Time
                </Badge>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
                {plans.map((plan) => {
                  const discount = plan.originalPrice - plan.discountedPrice;
                  const savings = Math.round((discount / plan.originalPrice) * 100);
                  
                  return (
                    <div
                      key={plan.id}
                      onClick={() => handlePlanSelect(plan)}
                      className="p-6 rounded-2xl border-2 border-gray-100 hover:border-purple-300 cursor-pointer transition-all duration-300 hover:shadow-lg bg-white"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-lg font-bold text-gray-900">{plan.type} Plan</h4>
                            {plan.type === 'Popular' && <Star className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Zap className="w-4 h-4 mr-1" />
                              {plan.data}
                            </span>
                            <span className="flex items-center">
                              <Phone className="w-4 h-4 mr-1" />
                              {plan.calls}
                            </span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {plan.validity}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">₹{plan.discountedPrice}</div>
                          <div className="text-sm text-gray-500 line-through">₹{plan.originalPrice}</div>
                          <div className="text-xs text-green-600 font-semibold">Save {savings}%</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          <Gift className="w-3 h-3 mr-1" />
                          Save ₹{discount}
                        </Badge>
                        <ArrowRight className="w-5 h-5 text-purple-600" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button 
                onClick={goBack}
                variant="outline"
                className="w-full py-3 rounded-xl"
              >
                Back to Operators
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Payment Confirmation */}
        {step === 4 && selectedPlan && selectedOperator && (
          <Card className="shadow-2xl bg-white/95 backdrop-blur-md border-0">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Payment</h2>
                <p className="text-gray-600">Review your recharge details</p>
              </div>

              {/* Recharge Summary */}
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Mobile Number:</span>
                    <div className="font-semibold text-gray-900">{mobileNumber}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Operator:</span>
                    <div className="font-semibold text-gray-900">{selectedOperator.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Plan:</span>
                    <div className="font-semibold text-gray-900">{selectedPlan.type}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Validity:</span>
                    <div className="font-semibold text-gray-900">{selectedPlan.validity}</div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-green-50 rounded-2xl p-6 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Original Price:</span>
                  <span className="text-gray-500 line-through">₹{selectedPlan.originalPrice}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-600">Discount (83%):</span>
                  <span className="text-green-600">-₹{selectedPlan.originalPrice - selectedPlan.discountedPrice}</span>
                </div>
                <div className="border-t border-green-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-600">₹{selectedPlan.discountedPrice}</span>
                  </div>
                </div>
              </div>

              {/* UPI Details */}
              <div className="bg-blue-50 rounded-2xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">UPI Payment Details</h4>
                <div className="text-sm text-gray-600 space-y-2">
                  <div>UPI ID: <span className="font-medium text-blue-600">rekhadevi573710.rzp@icici</span></div>
                  <div>Amount: <span className="font-medium">₹{selectedPlan.discountedPrice}</span></div>
                  <div className="text-xs text-blue-600">✓ Amount will be auto-filled in your payment app</div>
                </div>
              </div>

              {/* Payment Button */}
              <Button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold text-lg mb-4"
              >
                {isProcessing ? (
                  <>Processing Payment...</>
                ) : (
                  <>
                    <Shield className="w-5 h-5 mr-2" />
                    Pay Securely ₹{selectedPlan.discountedPrice}
                  </>
                )}
              </Button>

              <Button 
                onClick={goBack}
                variant="outline"
                className="w-full py-3 rounded-xl"
                disabled={isProcessing}
              >
                Back to Plans
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Features Banner */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/80 rounded-xl p-4">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-xs font-semibold text-gray-900">Instant</div>
            <div className="text-xs text-gray-600">Activation</div>
          </div>
          <div className="bg-white/80 rounded-xl p-4">
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-xs font-semibold text-gray-900">100%</div>
            <div className="text-xs text-gray-600">Secure</div>
          </div>
          <div className="bg-white/80 rounded-xl p-4">
            <Timer className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-xs font-semibold text-gray-900">24/7</div>
            <div className="text-xs text-gray-600">Support</div>
          </div>
        </div>
      </div>
    </div>
  );
}