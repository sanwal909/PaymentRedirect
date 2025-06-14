import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, X } from 'lucide-react';

interface UPIApp {
  id: string;
  name: string;
  scheme: string;
  color: string;
  icon: string;
}

interface UPIAppSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAppSelect: (app: UPIApp) => void;
  amount: number;
}

const UPI_APPS: UPIApp[] = [
  {
    id: 'gpay',
    name: 'Google Pay',
    scheme: 'gpay://upi/pay',
    color: 'bg-blue-600',
    icon: 'GP'
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    scheme: 'phonepe://pay',
    color: 'bg-purple-600',
    icon: 'PP'
  },
  {
    id: 'paytm',
    name: 'Paytm',
    scheme: 'paytmmp://pay',
    color: 'bg-blue-500',
    icon: 'PT'
  },
  {
    id: 'bhim',
    name: 'BHIM UPI',
    scheme: 'bhim://pay',
    color: 'bg-orange-600',
    icon: 'BU'
  },
  {
    id: 'amazonpay',
    name: 'Amazon Pay',
    scheme: 'amazonpay://pay',
    color: 'bg-yellow-600',
    icon: 'AP'
  },
  {
    id: 'other',
    name: 'Other UPI App',
    scheme: 'upi://pay',
    color: 'bg-gray-600',
    icon: 'UP'
  }
];

export function UPIAppSelector({ isOpen, onClose, onAppSelect, amount }: UPIAppSelectorProps) {
  const [selectedApp, setSelectedApp] = useState<UPIApp | null>(null);

  const handleAppSelection = (app: UPIApp) => {
    setSelectedApp(app);
    onAppSelect(app);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4 rounded-3xl p-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Choose Payment App</h3>
                <p className="text-sm text-gray-600">Select your preferred UPI app</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-3 mb-6">
            {UPI_APPS.map((app) => (
              <Card 
                key={app.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-blue-200"
                onClick={() => handleAppSelection(app)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 ${app.color} rounded-xl flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">{app.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{app.name}</h4>
                        <p className="text-sm text-gray-600">
                          Pay ₹{amount} securely
                        </p>
                      </div>
                    </div>
                    <div className="text-blue-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                  <path d="M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-blue-900">Secure UPI Payment</span>
            </div>
            <p className="text-xs text-blue-700">
              Your payment details will be securely processed through the selected app. 
              Amount ₹{amount} will be auto-filled.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}