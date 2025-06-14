import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
}

export function ErrorModal({ isOpen, onClose, onRetry }: ErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm w-full text-center rounded-3xl">
        <div className="p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h3>
          <p className="text-gray-600 mb-6">Please try again or contact support</p>
          <Button 
            onClick={onRetry || onClose}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold"
          >
            Try Again
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
