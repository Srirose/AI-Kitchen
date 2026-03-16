import React, { useState, useRef } from 'react';
import api from '../services/api';
import { Camera, Mic, Type, Upload, X, Loader2, CheckCircle } from 'lucide-react';

const FoodInput = () => {
  const [activeTab, setActiveTab] = useState('image');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mealType, setMealType] = useState('breakfast');
  const fileInputRef = useRef(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPreviewImage(URL.createObjectURL(file));
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/food/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const detectedFoods = response.data.data.detectedFoods;
      await analyzeFoods(detectedFoods);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      setIsLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post('/food/text', { text: textInput });
      const foods = response.data.data.extractedFoods;
      await analyzeFoods(foods);
    } catch (err) {
      setError('Failed to analyze text. Please try again.');
      setIsLoading(false);
    }
  };

  const handleVoiceRecord = async () => {
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      setTimeout(async () => {
        setIsRecording(false);
        setIsLoading(true);
        
        try {
          const mockAudio = btoa('mock audio data');
          const response = await api.post('/food/voice', { audio: mockAudio });
          const foods = response.data.data.extractedFoods;
          await analyzeFoods(foods);
        } catch (err) {
          setError('Failed to analyze voice. Please try again.');
          setIsLoading(false);
        }
      }, 3000);
    }
  };

  const analyzeFoods = async (foods) => {
    try {
      const response = await api.post('/food/analyze', {
        foodItems: foods,
        mealType
      });
      
      setResult(response.data.data);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to analyze food. Please try again.');
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setPreviewImage(null);
    setTextInput('');
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Food Entry</h1>

      {result ? (
        <div className="bg-white rounded-xl shadow-sm p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
            <button
              onClick={resetForm}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">Detected Foods</h3>
              <ul className="space-y-2">
                {result.analysis.foodItems.map((item, idx) => (
                  <li key={idx} className="flex items-center justify-between">
                    <span className="capitalize">{item.name}</span>
                    <span className="text-sm text-gray-500">
                      {item.nutrition.calories} kcal
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-3">Nutrition Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calories</span>
                  <span className="font-medium">{result.analysis.totalNutrition.calories} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protein</span>
                  <span className="font-medium">{result.analysis.totalNutrition.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Carbs</span>
                  <span className="font-medium">{result.analysis.totalNutrition.carbohydrates}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fat</span>
                  <span className="font-medium">{result.analysis.totalNutrition.fat}g</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-green-800">Sustainability Score</h3>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-green-700">
                {Math.round(result.analysis.sustainability.sustainabilityScore)}
              </span>
              <span className="text-lg font-medium text-green-600">
                Rating {result.analysis.sustainability.rating}
              </span>
            </div>
            <p className="text-sm text-green-600 mt-1">
              Carbon footprint: {result.analysis.sustainability.carbonFootprint} kg CO2e
            </p>
          </div>

          <button
            onClick={resetForm}
            className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition"
          >
            Add Another Entry
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          {/* Meal Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
            <div className="grid grid-cols-4 gap-2">
              {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                <button
                  key={type}
                  onClick={() => setMealType(type)}
                  className={`py-2 px-4 rounded-lg text-sm font-medium capitalize transition ${
                    mealType === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Input Tabs */}
          <div className="flex gap-2 mb-6">
            {[
              { id: 'image', icon: Camera, label: 'Image' },
              { id: 'voice', icon: Mic, label: 'Voice' },
              { id: 'text', icon: Type, label: 'Text' }
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  activeTab === id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Image Input */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition"
              >
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg"
                  />
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Voice Input */}
          {activeTab === 'voice' && (
            <div className="text-center py-8">
              <button
                onClick={handleVoiceRecord}
                className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition ${
                  isRecording
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                <Mic className="h-10 w-10 text-white" />
              </button>
              <p className="mt-4 text-gray-600">
                {isRecording ? 'Recording... Speak now' : 'Tap to start recording'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Describe what you ate, e.g., "I had a sandwich with chicken and lettuce"
              </p>
            </div>
          )}

          {/* Text Input */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Describe your meal... e.g., 'Grilled chicken salad with tomatoes and cucumber'"
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              <button
                onClick={handleTextSubmit}
                disabled={!textInput.trim() || isLoading}
                className="w-full py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Food'
                )}
              </button>
            </div>
          )}

          {isLoading && activeTab === 'image' && (
            <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Analyzing image...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodInput;
