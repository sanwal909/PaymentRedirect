import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, Smartphone, X } from 'lucide-react';
import type { RechargePlan, Operator } from '@/types/recharge';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: RechargePlan | null;
  operator: Operator | null;
  onPayment: () => void;
  isProcessing: boolean;
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  plan, 
  operator, 
  onPayment, 
  isProcessing 
}: PaymentModalProps) {
  if (!plan || !operator) return null;

  const discount = plan.originalPrice - plan.discountedPrice;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 rounded-t-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900">Payment Details</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Plan Info */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Selected Plan</span>
                <span className="text-lg font-bold text-primary">₹{plan.originalPrice}</span>
              </div>
              <div className="text-xs text-gray-500">
                {plan.data} • {plan.calls} • {plan.validity}
              </div>
            </CardContent>
          </Card>

          {/* Discount Breakdown */}
          <Card className="bg-green-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Original Price</span>
                <span className="text-sm line-through text-gray-500">₹{plan.originalPrice}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-green-600">Discount (83%)</span>
                <span className="text-sm text-green-600">-₹{discount}</span>
              </div>
              <div className="border-t border-green-200 pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Final Price</span>
                  <span className="text-xl font-bold text-green-600">₹{plan.discountedPrice}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* UPI Payment Section */}
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <Smartphone className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-semibold text-gray-900">Pay with UPI</span>
              </div>
              <div className="text-xs text-gray-600 mb-3">
                Payment will be processed through your default UPI app
              </div>
              <div className="flex items-center justify-center space-x-4">
                <img 
                  src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40" 
                  alt="Google Pay" 
                  className="w-8 h-8 rounded-lg"
                />
                <img 
                  src="https://images.unsplash.com/photo-1556742111-a301076d9d18?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40" 
                  alt="PhonePe" 
                  className="w-8 h-8 rounded-lg"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pay Now Button */}
          <Button 
            onClick={onPayment}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-primary to-purple-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Lock className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : `Pay Securely ₹${plan.discountedPrice}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
