import React from 'react';
import { Scale } from 'lucide-react';

const BMICard = ({ bmi }) => {
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    return { label: 'Obese', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const category = getBMICategory(bmi);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">BMI</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{bmi?.toFixed(1) || '--'}</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${category.bgColor} ${category.color}`}>
            {category.label}
          </span>
        </div>
        <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
          <Scale className="h-6 w-6 text-primary-600" />
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((bmi / 40) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>15</span>
          <span>25</span>
          <span>35</span>
          <span>40+</span>
        </div>
      </div>
    </div>
  );
};

export default BMICard;
