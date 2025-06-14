import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full text-center rounded-3xl">
        <div className="p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-6">Your mobile has been recharged successfully</p>
          <Button 
            onClick={onClose}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
