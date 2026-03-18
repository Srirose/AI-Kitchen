import React, { useState, useEffect } from 'react';
import Btn from '../components/Btn';
import Chip from '../components/Chip';
import VoiceBtn from '../components/VoiceBtn';
import ImgBtn from '../components/ImgBtn';
import { profileAPI } from '../utils/api';
import { calculateAllMetrics } from '../utils/math';

const MEAL_SLOTS = [
  { id: 'breakfast', name: 'Breakfast', icon: '🌅', color: '#f59e0b' },
  { id: 'lunch', name: 'Lunch', icon: '☀️', color: '#4ade80' },
  { id: 'dinner', name: 'Dinner', icon: '🌙', color: '#818cf8' },
  { id: 'snack', name: 'Snack', icon: '🍎', color: '#0ea5e9' },
  { id: 'dessert', name: 'Dessert', icon: '🍮', color: '#f472b6' },
  { id: 'brunch', name: 'Brunch', icon: '🥞', color: '#fb923c' },
  { id: 'supper', name: 'Supper', icon: '🌆', color: '#a78bfa' }
];

const FUTURE_SLOTS = [
  { id: 'elevenses', name: 'Elevenses', icon: '🔒' },
  { id: 'tiffin', name: 'Tiffin', icon: '🔒' }
];

const INGS = [
  'Rice', 'Wheat', 'Oats', 'Bread', 'Pasta', 'Quinoa', 'Millets', 'Ragi', 'Idli Batter', 'Dosa Batter',
  'Rava', 'Poha', 'Chicken', 'Egg', 'Paneer', 'Tofu', 'Lentils', 'Chickpeas', 'Kidney Beans', 'Fish',
  'Mutton', 'Prawn', 'Soya Chunks', 'Peanuts', 'Milk', 'Curd', 'Butter', 'Ghee', 'Cheese', 'Tomato',
  'Onion', 'Garlic', 'Spinach', 'Carrot', 'Potato', 'Broccoli', 'Capsicum', 'Cabbage', 'Peas', 'Cauliflower',
  'Mushroom', 'Corn', 'Apple', 'Banana', 'Orange', 'Mango', 'Coconut', 'Olive Oil', 'Coconut Oil', 'Turmeric',
  'Cumin', 'Coriander', 'Chilli', 'Pepper', 'Ginger', 'Tamarind', 'Jaggery', 'Sugar', 'Salt'
];

const MealPlanner = ({ currentUser, onAnalyze, onEditProfile, addToast }) => {
  const [profile, setProfile] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [activeSlot, setActiveSlot] = useState('breakfast');
  const [servings, setServings] = useState(1);
  const [mealIngredients, setMealIngredients] = useState({});
  const [customInput, setCustomInput] = useState('');
  const [imgPreview, setImgPreview] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await profileAPI.get();
        if (data.profile) {
          setProfile(data.profile);
          const m = calculateAllMetrics(data.profile);
          setMetrics(m);
        }
      } catch {
        addToast('Failed to load profile', 'error');
      }
    };
    loadProfile();
  }, [addToast]);

  const getSlotIngredients = (slotId) => mealIngredients[slotId] || [];

  const addIngredient = (ingredient) => {
    setMealIngredients(prev => {
      const current = prev[activeSlot] || [];
      if (current.includes(ingredient)) {
        addToast(`${ingredient} already added`, 'warn');
        return prev;
      }
      return { ...prev, [activeSlot]: [...current, ingredient] };
    });
    addToast(`Added ${ingredient}`, 'success');
  };

  const removeIngredient = (ingredient) => {
    setMealIngredients(prev => ({
      ...prev,
      [activeSlot]: (prev[activeSlot] || []).filter(i => i !== ingredient)
    }));
  };

  const handleCustomAdd = () => {
    if (customInput.trim()) {
      addIngredient(customInput.trim());
      setCustomInput('');
    }
  };

  const handleVoiceTranscript = (text) => {
    const words = text.toLowerCase().split(/[\s,]+/);
    let matched = 0;
    
    words.forEach(word => {
      const match = INGS.find(ing => ing.toLowerCase().includes(word) || word.includes(ing.toLowerCase()));
      if (match) {
        addIngredient(match);
        matched++;
      }
    });

    if (matched === 0) {
      addIngredient(text.trim());
    }
  };

  const handleImageResult = ({ preview, ingredients }) => {
    setImgPreview(preview);
    // Add detected ingredients to current meal slot
    ingredients.forEach(ing => addIngredient(ing));
  };

  const handleAnalyze = () => {
    const ingredients = getSlotIngredients(activeSlot);
    if (ingredients.length === 0) {
      addToast('Please add at least one ingredient', 'error');
      return;
    }

    const slot = MEAL_SLOTS.find(s => s.id === activeSlot);
    onAnalyze({
      meal: slot.name,
      mealId: activeSlot,
      mealColor: slot.color,
      servings,
      ingredients
    });
  };

  const handleGoToChat = () => {
    // Create a default meal data for chat mode
    onAnalyze({
      meal: 'Chat',
      mealId: 'chat',
      mealColor: '#4ade80',
      servings: 1,
      ingredients: []
    });
  };

  const currentIngredients = getSlotIngredients(activeSlot);
  const activeSlotData = MEAL_SLOTS.find(s => s.id === activeSlot);

  return (
    <div style={{
      minHeight: '100vh',
      padding: '16px',
      background: '#070d17'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>🌿</span>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#dde6f0' }}>NutriAI Pro</span>
        </div>
        <div style={{ fontSize: '13px', color: '#4a6280' }}>
          {currentUser?.username}
        </div>
      </div>

      {/* Stats Strip */}
      {metrics && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <div style={{
            background: '#111e2e',
            borderRadius: '12px',
            padding: '12px 8px',
            textAlign: 'center',
            border: '1px solid #1a3350'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: metrics.bmiCategory.color }}>
              {metrics.bmi}
            </div>
            <div style={{ fontSize: '10px', color: '#4a6280' }}>BMI</div>
          </div>
          <div style={{
            background: '#111e2e',
            borderRadius: '12px',
            padding: '12px 8px',
            textAlign: 'center',
            border: '1px solid #1a3350'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#4ade80' }}>
              {metrics.bmr}
            </div>
            <div style={{ fontSize: '10px', color: '#4a6280' }}>BMR</div>
          </div>
          <div style={{
            background: '#111e2e',
            borderRadius: '12px',
            padding: '12px 8px',
            textAlign: 'center',
            border: '1px solid #1a3350'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0ea5e9' }}>
              {metrics.tdee}
            </div>
            <div style={{ fontSize: '10px', color: '#4a6280' }}>TDEE</div>
          </div>
          <div style={{
            background: '#111e2e',
            borderRadius: '12px',
            padding: '12px 8px',
            textAlign: 'center',
            border: '1px solid #1a3350'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#f59e0b' }}>
              {profile?.goal?.split(' ')[0] || '-'}
            </div>
            <div style={{ fontSize: '10px', color: '#4a6280' }}>Goal</div>
          </div>
        </div>
      )}

      {/* Meal Slot Selector */}
      <div style={{
        background: '#111e2e',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        border: '1px solid #1a3350'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#dde6f0', marginBottom: '12px' }}>
          Select Meal Slot
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none'
        }}>
          {MEAL_SLOTS.map(slot => {
            const count = (mealIngredients[slot.id] || []).length;
            const isActive = activeSlot === slot.id;
            return (
              <button
                key={slot.id}
                onClick={() => setActiveSlot(slot.id)}
                style={{
                  flexShrink: 0,
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: `1px solid ${isActive ? slot.color : '#1a3350'}`,
                  background: isActive ? `${slot.color}20` : '#0d1520',
                  color: isActive ? slot.color : '#dde6f0',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  position: 'relative'
                }}
              >
                <span>{slot.icon}</span>
                <span>{slot.name}</span>
                {count > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: slot.color,
                    color: '#070d17',
                    fontSize: '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
          {FUTURE_SLOTS.map(slot => (
            <div
              key={slot.id}
              style={{
                flexShrink: 0,
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid #1a3350',
                background: '#0a1018',
                color: '#4a6280',
                fontSize: '13px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: 0.5
              }}
            >
              <span>{slot.icon}</span>
              <span>{slot.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Servings */}
      <div style={{
        background: '#111e2e',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        border: '1px solid #1a3350'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#dde6f0', marginBottom: '12px' }}>
          Servings: {servings}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5, 6].map(n => (
            <button
              key={n}
              onClick={() => setServings(n)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                border: `1px solid ${servings === n ? activeSlotData.color : '#1a3350'}`,
                background: servings === n ? activeSlotData.color : '#0d1520',
                color: servings === n ? '#070d17' : '#dde6f0',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredient Panel */}
      <div style={{
        background: '#111e2e',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        border: `1px solid ${activeSlotData.color}40`
      }}>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: 600, 
          color: activeSlotData.color,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>{activeSlotData.icon}</span>
          <span>{activeSlotData.name} Ingredients</span>
        </div>

        {/* Custom Input */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomAdd()}
            placeholder="Add custom ingredient..."
            style={{
              flex: 1,
              padding: '12px 14px',
              background: '#0d1520',
              border: '1px solid #1a3350',
              borderRadius: '10px',
              color: '#dde6f0',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button
            onClick={handleCustomAdd}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              border: 'none',
              background: activeSlotData.color,
              color: '#070d17',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            +
          </button>
        </div>

        {/* Voice & Photo */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
          <VoiceBtn onTranscript={handleVoiceTranscript} addToast={addToast} />
          <ImgBtn onImageSelect={handleImageResult} addToast={addToast} />
        </div>

        {/* Image Preview */}
        {imgPreview && (
          <div style={{
            marginBottom: '16px',
            borderRadius: '10px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <img src={imgPreview} alt="Preview" style={{ width: '100%', height: 'auto' }} />
            <button
              onClick={() => setImgPreview(null)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                border: 'none',
                background: '#f87171',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Quick Select */}
        <div style={{ 
          maxHeight: '120px', 
          overflowY: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          padding: '4px'
        }}>
          {INGS.map(ing => (
            <Chip
              key={ing}
              active={currentIngredients.includes(ing)}
              onClick={() => currentIngredients.includes(ing) ? removeIngredient(ing) : addIngredient(ing)}
              color={activeSlotData.color}
            >
              {ing}
            </Chip>
          ))}
        </div>
      </div>

      {/* Selected Ingredients Summary */}
      {currentIngredients.length > 0 && (
        <div style={{
          background: '#0d1520',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '16px',
          border: '1px solid #1a3350'
        }}>
          <div style={{ fontSize: '12px', color: '#4a6280', marginBottom: '6px' }}>
            Selected ({currentIngredients.length}):
          </div>
          <div style={{ fontSize: '13px', color: '#dde6f0', lineHeight: 1.5 }}>
            {currentIngredients.join(' · ')}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '24px' }}>
        <Btn
          variant="primary"
          size="lg"
          disabled={currentIngredients.length === 0}
          onClick={handleAnalyze}
          style={{ width: '100%' }}
        >
          🌿 Analyze {activeSlotData.name} & Get Recipes →
        </Btn>
        <Btn
          variant="ghost"
          size="md"
          onClick={handleGoToChat}
          style={{ width: '100%' }}
        >
          💬 Go to Chat Mode
        </Btn>
        <Btn
          variant="ghost"
          size="md"
          onClick={onEditProfile}
          style={{ width: '100%' }}
        >
          ✏️ Edit My Profile
        </Btn>
      </div>
    </div>
  );
};

export default MealPlanner;
