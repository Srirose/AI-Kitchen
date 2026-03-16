import React from 'react';
import { Utensils } from 'lucide-react';

const CalorieTracker = ({ consumed, target }) => {
  const remaining = target - consumed;
  const percentage = target > 0 ? (consumed / target) * 100 : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Calories Today</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-3xl font-bold text-gray-900">{consumed}</p>
            <span className="text-sm text-gray-400">/ {target}</span>
          </div>
          <p className={`text-sm mt-1 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {remaining >= 0 ? `${remaining} remaining` : `${Math.abs(remaining)} over`}
          </p>
        </div>
        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Utensils className="h-6 w-6 text-blue-600" />
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              percentage > 100 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default CalorieTracker;
