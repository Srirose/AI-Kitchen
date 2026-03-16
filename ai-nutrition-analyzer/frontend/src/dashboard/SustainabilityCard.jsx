import React from 'react';
import { Leaf } from 'lucide-react';

const SustainabilityCard = ({ score }) => {
  const getRating = (score) => {
    if (score >= 80) return { label: 'A', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (score >= 65) return { label: 'B', color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    if (score >= 50) return { label: 'C', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (score >= 35) return { label: 'D', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { label: 'F', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const rating = getRating(score);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Sustainability</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{Math.round(score)}</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${rating.bgColor} ${rating.color}`}>
            Rating {rating.label}
          </span>
        </div>
        <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
          <Leaf className="h-6 w-6 text-green-600" />
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Based on carbon footprint of your meals
        </p>
      </div>
    </div>
  );
};

export default SustainabilityCard;
