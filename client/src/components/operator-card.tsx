import { Card } from '@/components/ui/card';
import type { Operator } from '@/types/recharge';

interface OperatorCardProps {
  operator: Operator;
  isSelected?: boolean;
  onClick: () => void;
}

export function OperatorCard({ operator, isSelected, onClick }: OperatorCardProps) {
  return (
    <Card 
      className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
        isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
      }`}
      onClick={onClick}
    >
      <div className="text-center">
        {operator.logoUrl && (
          <img 
            src={operator.logoUrl} 
            alt={`${operator.name} Logo`}
            className="w-16 h-10 object-contain mx-auto mb-2"
          />
        )}
        <h3 className="font-semibold text-gray-900">{operator.name}</h3>
        <p className="text-xs text-gray-500">
          {operator.name === 'Jio' && "India's #1 Network"}
          {operator.name === 'Airtel' && "India's Fastest Network"}
          {operator.name === 'Vi' && "Strong Network"}
          {operator.name === 'BSNL' && "Nationwide Coverage"}
        </p>
      </div>
    </Card>
  );
}
