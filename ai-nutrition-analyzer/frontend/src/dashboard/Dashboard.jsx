import React, { useEffect, useState } from 'react';
import api from '../services/api';
import BMICard from './BMICard';
import BMRCard from './BMRCard';
import CalorieTracker from './CalorieTracker';
import MacroChart from './MacroChart';
import WeeklyChart from './WeeklyChart';
import SustainabilityCard from './SustainabilityCard';
import { Loader2, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dailyReport, setDailyReport] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [profileRes, dailyRes, weeklyRes] = await Promise.all([
        api.get('/user/profile'),
        api.get('/nutrition/report/daily'),
        api.get('/nutrition/report/weekly')
      ]);

      setProfile(profileRes.data.data.user);
      setDailyReport(dailyRes.data.data);
      setWeeklyReport(weeklyRes.data.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {profile && (
          <>
            <BMICard bmi={profile.bmi} />
            <BMRCard bmr={profile.bmr} />
            <CalorieTracker 
              consumed={dailyReport?.consumed?.calories || 0}
              target={profile.dailyCalorieTarget}
            />
            <SustainabilityCard 
              score={dailyReport?.consumed?.sustainabilityScore || 0}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dailyReport?.macroBreakdown && (
          <MacroChart macroData={dailyReport.macroBreakdown} />
        )}
        {weeklyReport?.dailyBreakdown && (
          <WeeklyChart weeklyData={weeklyReport.dailyBreakdown} />
        )}
      </div>

      {/* Recent Meals */}
      {dailyReport?.meals && dailyReport.meals.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Meals</h2>
          <div className="space-y-3">
            {dailyReport.meals.map((meal, index) => (
              <div 
                key={index}
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
                      {new Date(meal.time).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{meal.nutrition?.calories || 0} kcal</p>
                  <p className="text-sm text-green-600">
                    Score: {Math.round(meal.sustainability?.sustainabilityScore || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
