import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { Trash2, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const History = () => {
  const [meals, setMeals] = useState([]);
  const [calendarData, setCalendarData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');

  useEffect(() => {
    fetchMeals();
    fetchCalendarData();
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await api.get('/history');
      setMeals(response.data.data.meals);
    } catch (error) {
      console.error('Failed to fetch meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCalendarData = async () => {
    try {
      const now = new Date();
      const response = await api.get(`/history/calendar?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);
      const data = {};
      response.data.data.days.forEach(day => {
        data[day.date] = day;
      });
      setCalendarData(data);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    }
  };

  const handleDelete = async (mealId) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;
    
    try {
      await api.delete(`/history/${mealId}`);
      setMeals(meals.filter(m => m.id !== mealId));
    } catch (error) {
      console.error('Failed to delete meal:', error);
    }
  };

  const getTileContent = ({ date }) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = calendarData[dateStr];
    
    if (dayData) {
      return (
        <div className="text-xs mt-1">
          <div className="text-primary-600 font-medium">{dayData.totalCalories} kcal</div>
        </div>
      );
    }
    return null;
  };

  const filteredMeals = meals.filter(meal => {
    const mealDate = new Date(meal.date);
    return format(mealDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meal History</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('list')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'list' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            List
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              view === 'calendar' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {view === 'calendar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileContent={getTileContent}
              className="w-full"
            />
          </div>
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Meals for {format(selectedDate, 'MMMM d, yyyy')}
              </h2>
              
              {filteredMeals.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No meals recorded for this date</p>
              ) : (
                <div className="space-y-3">
                  {filteredMeals.map((meal) => (
                    <div 
                      key={meal.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-medium capitalize">
                            {meal.mealType.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{meal.mealType}</p>
                          <p className="text-sm text-gray-500">
                            {meal.foodItems.map(f => f.name).join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {meal.totalNutrition?.calories || 0} kcal
                          </p>
                          <p className="text-sm text-green-600">
                            Score: {Math.round(meal.sustainability?.sustainabilityScore || 0)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDelete(meal.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          {meals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No meals recorded yet</p>
          ) : (
            <div className="space-y-4">
              {meals.map((meal) => (
                <div 
                  key={meal.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-medium capitalize">
                        {meal.mealType.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 capitalize">{meal.mealType}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(meal.date), 'MMM d, yyyy')} at{' '}
                        {format(new Date(meal.date), 'h:mm a')}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {meal.foodItems.map(f => f.name).join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {meal.totalNutrition?.calories || 0} kcal
                      </p>
                      <p className="text-sm text-gray-500">
                        P: {Math.round(meal.totalNutrition?.protein || 0)}g | 
                        C: {Math.round(meal.totalNutrition?.carbohydrates || 0)}g | 
                        F: {Math.round(meal.totalNutrition?.fat || 0)}g
                      </p>
                      <p className="text-sm text-green-600">
                        Sustainability: {Math.round(meal.sustainability?.sustainabilityScore || 0)}/100
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(meal.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default History;
