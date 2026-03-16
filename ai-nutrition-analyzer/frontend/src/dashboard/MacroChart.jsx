import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const MacroChart = ({ macroData }) => {
  const data = [
    { name: 'Protein', value: parseFloat(macroData?.protein?.percentage) || 0, color: '#10b981' },
    { name: 'Carbs', value: parseFloat(macroData?.carbohydrates?.percentage) || 0, color: '#3b82f6' },
    { name: 'Fat', value: parseFloat(macroData?.fat?.percentage) || 0, color: '#f59e0b' },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    data.forEach(item => item.value = 33.33);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Macronutrient Breakdown</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `${value.toFixed(1)}%`}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <p className="text-sm text-gray-500">Protein</p>
          <p className="font-semibold text-gray-900">{macroData?.protein?.grams || 0}g</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Carbs</p>
          <p className="font-semibold text-gray-900">{macroData?.carbohydrates?.grams || 0}g</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Fat</p>
          <p className="font-semibold text-gray-900">{macroData?.fat?.grams || 0}g</p>
        </div>
      </div>
    </div>
  );
};

export default MacroChart;
