import React from 'react';
import { Flame } from 'lucide-react';

const BMRCard = ({ bmr }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">BMR</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {bmr ? Math.round(bmr) : '--'}
          </p>
          <p className="text-sm text-gray-400 mt-1">calories/day</p>
        </div>
        <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
          <Flame className="h-6 w-6 text-orange-600" />
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-4">
        Basal Metabolic Rate - calories burned at rest
      </p>
    </div>
  );
};

export default BMRCard;
