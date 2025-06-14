import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IdCard } from 'lucide-react';
import type { RechargePlan, Operator } from '@/types/recharge';

interface PlanCardProps {
  plan: RechargePlan;
  operator: Operator;
  onSelect: () => void;
}

export function PlanCard({ plan, operator, onSelect }: PlanCardProps) {
  const discount = plan.originalPrice - plan.discountedPrice;
  const discountPercentage = Math.round((discount / plan.originalPrice) * 100);

  return (
    <Card className="shadow-lg border border-gray-100 hover:shadow-xl hover:border-primary transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-xl flex items-center justify-center">
              <IdCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{plan.type} Plan</h4>
              <p className="text-xs text-gray-500">{operator.name.toUpperCase()}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-primary">₹{plan.discountedPrice}</div>
            <div className="text-xs text-gray-500 line-through">₹{plan.originalPrice}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900">{plan.data}</div>
            <div className="text-xs text-gray-500">Data</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900">{plan.calls}</div>
            <div className="text-xs text-gray-500">Calls</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900">{plan.validity}</div>
            <div className="text-xs text-gray-500">Validity</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-pink-100 text-pink-600">
            Save ₹{discount}
          </Badge>
          <Button 
            onClick={onSelect}
            className="bg-primary hover:bg-purple-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            Recharge Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
