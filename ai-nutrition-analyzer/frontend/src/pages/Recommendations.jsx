import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Lightbulb, Leaf, Clock, Flame, ChevronRight, Loader2 } from 'lucide-react';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMealType, setSelectedMealType] = useState('');

  useEffect(() => {
    fetchRecommendations();
    fetchTips();
  }, [selectedMealType]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const params = selectedMealType ? `?mealType=${selectedMealType}` : '';
      const response = await api.get(`/recommendations${params}`);
      setRecommendations(response.data.data.recommendations);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTips = async () => {
    try {
      const response = await api.get('/recommendations/sustainability-tips');
      setTips(response.data.data.tips);
    } catch (error) {
      console.error('Failed to fetch tips:', error);
    }
  };

  const mealTypes = [
    { value: '', label: 'All Meals' },
    { value: 'breakfast', label: 'Breakfast' },
    { value: 'lunch', label: 'Lunch' },
    { value: 'dinner', label: 'Dinner' },
    { value: 'snack', label: 'Snack' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">AI Recommendations</h1>
        <select
          value={selectedMealType}
          onChange={(e) => setSelectedMealType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {mealTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Sustainability Tips */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Leaf className="h-5 w-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Sustainability Tips</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 mt-0.5">•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h2>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((meal, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700 capitalize">
                      {meal.type}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-2">{meal.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-green-600">
                      <Leaf className="h-4 w-4" />
                      <span className="font-medium">{Math.round(meal.sustainabilityScore)}</span>
                    </div>
                    <span className="text-xs text-gray-400">sustainability</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>{meal.calories} kcal</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>{meal.prepTime} min</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {meal.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md capitalize"
                    >
                      {tag.replace('-', ' ')}
                    </span>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">Ingredients:</span>{' '}
                    {meal.ingredients.join(', ')}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex gap-3 text-gray-500">
                      <span>P: {meal.protein}g</span>
                      <span>C: {meal.carbs}g</span>
                      <span>F: {meal.fat}g</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary-600">
                      <span className="font-medium">Score: {Math.round(meal.totalScore)}</span>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      Recommended because it's highly sustainable with low carbon footprint
                      {meal.healthScore > 80 && ' and excellent for your health goals'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
