import React, { useState, useEffect, useRef } from 'react';
import Btn from '../components/Btn';
import Chip from '../components/Chip';
import QuestionCard from '../components/QuestionCard';
import AnswerCard from '../components/AnswerCard';
import BreakfastSkippedCard from '../components/BreakfastSkippedCard';
import PreviousMealSummary from '../components/PreviousMealSummary';
import RecipeCard from '../components/RecipeCard';
import { LoadingCard, RecipesReadyCard, UserQueryCard, AIAnswerCard } from '../components/ChatCards';
import VoiceBtn from '../components/VoiceBtn';
import ImgBtn from '../components/ImgBtn';
import { profileAPI, analyzeAPI, logsAPI } from '../utils/api';
import { calculateAllMetrics } from '../utils/math';

const TABS = [
  { id: 'chat', label: '💬 Chat' },
  { id: 'recipes', label: '🍳 Recipes' },
  { id: 'stats', label: '📊 Stats' },
  { id: 'history', label: '📅 History' }
];

const PRE_DRINK_OPTIONS = [
  { id: 'coffee', icon: '☕', label: 'Coffee' },
  { id: 'milk', icon: '🥛', label: 'Milk' },
  { id: 'lemon', icon: '🍋', label: 'Lemon Honey Water' },
  { id: 'tea', icon: '🫖', label: 'Tea' },
  { id: 'juice', icon: '🧃', label: 'Juice' },
  { id: 'herbal', icon: '🌿', label: 'Herbal Drink' },
  { id: 'supplements', icon: '💊', label: 'Supplements' },
  { id: 'nothing', icon: '❌', label: 'Nothing' }
];

const COMMON_INGREDIENTS = [
  'Rice', 'Wheat', 'Oats', 'Bread', 'Onion', 'Tomato', 'Garlic', 
  'Ginger', 'Potato', 'Carrot', 'Spinach', 'Paneer', 'Egg', 'Chicken'
];

const AnalysisScreen = ({ mealData, onBack, onEditProfile, onLogout, addToast }) => {
  const [profile, setProfile] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const chatEndRef = useRef(null);
  
  // Flow state machine as per PDF
  const [flowState, setFlowState] = useState({
    stage: 'init',
    mealType: mealData?.meal || 'Meal',
    preMealAnswers: {},
    extraIngredients: [],
    allIngredients: [...(mealData?.ingredients || [])],
    nutritionLog: {},
    skippedBreakfast: false,
    chatHistory: [],
    recipes: [],
    loading: false,
    previousMealNutrients: null
  });

  const [inputText, setInputText] = useState('');
  const [freeQueryInput, setFreeQueryInput] = useState('');
  const [freeQueryHistory, setFreeQueryHistory] = useState([]);
  const [history, setHistory] = useState([]);
  const [showIngredientPanel, setShowIngredientPanel] = useState(false);

  const mealColor = mealData?.mealColor || '#4ade80';
  const mealType = flowState.mealType.toLowerCase();

  // Load profile and history
  useEffect(() => {
    const loadData = async () => {
      try {
        const profileData = await profileAPI.get();
        if (profileData.profile) {
          setProfile(profileData.profile);
          setMetrics(calculateAllMetrics(profileData.profile));
        }
        const logsData = await logsAPI.getAll();
        setHistory(logsData.logs || []);
      } catch {
        // Handle silently
      }
    };
    loadData();
  }, []);

  // Initialize flow based on meal type
  useEffect(() => {
    if (flowState.stage === 'init' && mealData?.meal) {
      const meal = mealData.meal.toLowerCase();
      setTimeout(() => {
        if (meal === 'breakfast') {
          setFlowState(prev => ({ ...prev, stage: 'breakfast_predrink' }));
        } else if (meal === 'lunch') {
          setFlowState(prev => ({ ...prev, stage: 'prev_meal_check' }));
        } else if (meal === 'snack') {
          setFlowState(prev => ({ ...prev, stage: 'prev_meal_check' }));
        } else if (meal === 'dinner') {
          setFlowState(prev => ({ ...prev, stage: 'prev_meal_check' }));
        } else if (meal === 'dessert') {
          setFlowState(prev => ({ ...prev, stage: 'prev_meal_check' }));
        } else if (meal === 'brunch') {
          setFlowState(prev => ({ ...prev, stage: 'prev_meal_check' }));
        } else if (meal === 'supper') {
          setFlowState(prev => ({ ...prev, stage: 'prev_meal_check' }));
        } else {
          setFlowState(prev => ({ ...prev, stage: 'extra_ings' }));
        }
      }, 100);
    }
  }, [flowState.stage, mealData]);

  // Scroll to bottom when chat updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [flowState.chatHistory, freeQueryHistory, flowState.stage]);

  // Get question text based on meal type
  const getPrevMealQuestion = () => {
    switch (mealType) {
      case 'lunch': return 'Before we plan your lunch — did you have breakfast today?';
      case 'snack': return 'Did you have lunch today?';
      case 'dinner': return 'Did you have lunch and any snacks today?';
      case 'dessert': return 'Have you had your main meal?';
      case 'brunch': return 'Did you have anything this morning before brunch?';
      case 'supper': return 'Did you have dinner already or is this replacing dinner?';
      default: return 'Did you have your previous meal?';
    }
  };

  const getPrevMealName = () => {
    switch (mealType) {
      case 'lunch': return 'Breakfast';
      case 'snack': return 'Lunch';
      case 'dinner': return 'Lunch & Snacks';
      case 'dessert': return 'Main meal';
      case 'brunch': return 'Morning meal';
      case 'supper': return 'Dinner';
      default: return 'Previous meal';
    }
  };

  // Handlers for breakfast flow
  const handlePreDrinkSelect = (option) => {
    if (option.id === 'nothing') {
      setFlowState(prev => ({
        ...prev,
        preMealAnswers: { ...prev.preMealAnswers, preDrink: null },
        chatHistory: [...prev.chatHistory, { type: 'answer', text: 'Nothing yet' }],
        stage: 'extra_ings'
      }));
    } else {
      setFlowState(prev => ({
        ...prev,
        preMealAnswers: { ...prev.preMealAnswers, preDrink: option },
        chatHistory: [...prev.chatHistory, { type: 'answer', text: `${option.icon} ${option.label}` }],
        stage: 'breakfast_predrink_qty'
      }));
    }
  };

  const handlePreDrinkQtySubmit = () => {
    if (!inputText.trim()) {
      addToast('Please enter quantity', 'warn');
      return;
    }
    setFlowState(prev => ({
      ...prev,
      preMealAnswers: { ...prev.preMealAnswers, preDrinkQty: inputText },
      chatHistory: [...prev.chatHistory, { type: 'answer', text: inputText }],
      stage: 'extra_ings'
    }));
    setInputText('');
  };

  // Handlers for other meals flow
  const handlePrevMealCheck = (hadMeal) => {
    if (!hadMeal) {
      setFlowState(prev => ({
        ...prev,
        skippedBreakfast: mealType === 'lunch',
        chatHistory: [...prev.chatHistory, { type: 'answer', text: 'No, I skipped it' }],
        stage: 'prev_meal_skipped'
      }));
    } else {
      setFlowState(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, { type: 'answer', text: 'Yes, I did' }],
        stage: 'prev_meal_what'
      }));
    }
  };

  const handlePrevMealWhatSubmit = () => {
    if (!inputText.trim()) {
      addToast('Please enter what you had', 'warn');
      return;
    }
    setFlowState(prev => ({
      ...prev,
      preMealAnswers: { ...prev.preMealAnswers, prevMealItems: inputText },
      chatHistory: [...prev.chatHistory, { type: 'answer', text: inputText }],
      stage: 'prev_meal_qty'
    }));
    setInputText('');
  };

  const handlePrevMealQtySubmit = async () => {
    if (!inputText.trim()) {
      addToast('Please enter quantity', 'warn');
      return;
    }
    
    setFlowState(prev => ({
      ...prev,
      preMealAnswers: { ...prev.preMealAnswers, prevMealQty: inputText },
      chatHistory: [...prev.chatHistory, { type: 'answer', text: inputText }],
      loading: true
    }));

    // Calculate previous meal nutrition (simulated)
    const items = flowState.preMealAnswers.prevMealItems || '';
    const calories = items.toLowerCase().includes('idli') ? 150 : 
                     items.toLowerCase().includes('paratha') ? 250 :
                     items.toLowerCase().includes('oats') ? 200 : 280;
    const qtyMultiplier = parseInt(inputText.match(/\d+/)?.[0] || '1');
    
    const prevNutrients = {
      calories: calories * qtyMultiplier,
      protein: 8 * qtyMultiplier,
      carbs: 45 * qtyMultiplier,
      fat: 6 * qtyMultiplier,
      fiber: 4 * qtyMultiplier
    };

    setTimeout(() => {
      setFlowState(prev => ({
        ...prev,
        previousMealNutrients: prevNutrients,
        loading: false,
        stage: 'prev_meal_summary'
      }));
    }, 500);
    
    setInputText('');
  };

  const continueToPrevMealSkip = () => {
    setFlowState(prev => ({ ...prev, stage: 'extra_ings' }));
  };

  const continueFromSummary = () => {
    setFlowState(prev => ({ ...prev, stage: 'extra_ings' }));
  };

  // Extra ingredients handlers
  const addExtraIngredient = (ingredient) => {
    if (flowState.allIngredients.includes(ingredient)) {
      addToast(`${ingredient} already added`, 'warn');
      return;
    }
    setFlowState(prev => ({
      ...prev,
      extraIngredients: [...prev.extraIngredients, ingredient],
      allIngredients: [...new Set([...prev.allIngredients, ingredient])]
    }));
    addToast(`Added ${ingredient}`, 'success');
  };

  const handleImageResult = ({ ingredients }) => {
    ingredients.forEach(ing => addExtraIngredient(ing));
  };

  const handleVoiceTranscript = (text) => {
    // Try to match with known ingredients
    const words = text.toLowerCase().split(/[\s,]+/);
    let matched = 0;
    words.forEach(word => {
      const match = COMMON_INGREDIENTS.find(ing => 
        ing.toLowerCase().includes(word) || word.includes(ing.toLowerCase())
      );
      if (match) {
        addExtraIngredient(match);
        matched++;
      }
    });
    if (matched === 0) {
      addExtraIngredient(text.trim());
    }
  };

  // Generate recipes
  const generateRecipes = async () => {
    setFlowState(prev => ({ ...prev, loading: true }));
    
    try {
      const messages = [{
        role: 'user',
        content: `Generate ${flowState.mealType} recipes with: ${flowState.allIngredients.join(', ')}`
      }];
      
      const data = await analyzeAPI.chat(
        messages,
        profile,
        { 
          meal: flowState.mealType, 
          servings: mealData?.servings || 1, 
          ingredients: flowState.allIngredients 
        }
      );

      // Parse recipes from <RECIPES> tags
      let parsedRecipes = data.recipes || [];
      if (data.reply) {
        const match = data.reply.match(/<RECIPES>([\s\S]*?)<\/RECIPES>/);
        if (match) {
          try {
            parsedRecipes = JSON.parse(match[1]);
          } catch {
            // Use data.recipes if parsing fails
          }
        }
      }

      setFlowState(prev => ({
        ...prev,
        stage: 'recipes',
        recipes: parsedRecipes,
        nutritionLog: data.nutrients || parsedRecipes[0] || {},
        chatHistory: [...prev.chatHistory, { type: 'recipes_ready', count: parsedRecipes.length }],
        loading: false
      }));

      // Save log
      logsAPI.save(
        new Date().toISOString().split('T')[0],
        { meal: flowState.mealType, servings: mealData?.servings || 1, ingredients: flowState.allIngredients },
        data.nutrients || parsedRecipes[0],
        messages
      ).then(() => {
        logsAPI.getAll().then(d => setHistory(d.logs || []));
      }).catch(() => {});

    } catch {
      addToast('Failed to generate recipes. Please try again.', 'error');
      setFlowState(prev => ({ ...prev, loading: false }));
    }
  };

  // Free query handler
  const handleFreeQuery = async (query) => {
    if (!query.trim()) return;
    
    setFreeQueryHistory(prev => [...prev, { type: 'user', text: query }]);
    setFreeQueryInput('');

    try {
      const data = await analyzeAPI.chat(
        [{ role: 'user', content: query }],
        profile,
        { meal: flowState.mealType, servings: 1, ingredients: flowState.allIngredients }
      );
      
      // Clean response (remove RECIPES tags for display)
      let cleanReply = data.reply || 'I apologize, I could not process that request.';
      cleanReply = cleanReply.replace(/<RECIPES>[\s\S]*?<\/RECIPES>/g, '').trim();
      
      setFreeQueryHistory(prev => [...prev, { type: 'ai', text: cleanReply }]);
    } catch {
      setFreeQueryHistory(prev => [...prev, { type: 'ai', text: 'Sorry, I could not process your request.' }]);
    }
  };

  // Calculate targets based on profile goal
  const getTargets = () => {
    const tdee = metrics?.tdee || 2000;
    const goal = profile?.goal?.toLowerCase() || '';
    
    let calorieTarget = tdee;
    if (goal.includes('weight loss')) calorieTarget = tdee - 500;
    else if (goal.includes('muscle gain')) calorieTarget = tdee + 300;
    
    return {
      calorieTarget: Math.round(calorieTarget / 3), // Per meal
      proteinTarget: 50,
      carbsTarget: 150,
      fatTarget: 50,
      fiberTarget: 15
    };
  };

  // Get step numbers based on meal type and stage
  const getStepInfo = () => {
    if (mealType === 'breakfast') {
      const steps = { breakfast_predrink: 1, breakfast_predrink_qty: 2, extra_ings: 3 };
      return { current: steps[flowState.stage] || 1, total: 3 };
    }
    const steps = { prev_meal_check: 1, prev_meal_what: 2, prev_meal_qty: 3, prev_meal_summary: 4, extra_ings: 5 };
    return { current: steps[flowState.stage] || 1, total: 5 };
  };

  // Render the guided flow content
  const renderFlowContent = () => {
    const stepInfo = getStepInfo();

    // Render previous chat history answers
    const renderHistory = () => (
      flowState.chatHistory.map((item, idx) => {
        if (item.type === 'answer') {
          return <AnswerCard key={idx} answer={item.text} mealColor={mealColor} />;
        }
        if (item.type === 'recipes_ready') {
          return <RecipesReadyCard key={idx} count={item.count} mealColor={mealColor} />;
        }
        return null;
      })
    );

    switch (flowState.stage) {
      // ===== BREAKFAST FLOW =====
      case 'breakfast_predrink':
        return (
          <>
            {renderHistory()}
            <QuestionCard 
              step={1} total={3} 
              title="Pre-meal Check" 
              question="Good morning! Before your breakfast — do you have any of these in the morning?"
              mealColor={mealColor}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {PRE_DRINK_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handlePreDrinkSelect(opt)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #1a3350',
                      background: '#070d17',
                      color: '#dde6f0',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </QuestionCard>
          </>
        );

      case 'breakfast_predrink_qty':
        return (
          <>
            {renderHistory()}
            <QuestionCard 
              step={2} total={3} 
              title="Quantity" 
              question={`Great! How much ${flowState.preMealAnswers.preDrink?.label} did you have?`}
              mealColor={mealColor}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePreDrinkQtySubmit()}
                  placeholder="e.g. 1 cup, 200ml"
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    background: '#070d17',
                    border: '1px solid #1a3350',
                    borderRadius: '10px',
                    color: '#dde6f0',
                    fontSize: '14px'
                  }}
                />
                <Btn onClick={handlePreDrinkQtySubmit} variant="primary">Next →</Btn>
              </div>
            </QuestionCard>
          </>
        );

      // ===== OTHER MEALS FLOW =====
      case 'prev_meal_check':
        return (
          <>
            {renderHistory()}
            <QuestionCard 
              step={1} total={5} 
              title={`${getPrevMealName()} Check`} 
              question={getPrevMealQuestion()}
              mealColor={mealColor}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <Btn onClick={() => handlePrevMealCheck(true)} variant="primary" style={{ flex: 1 }}>
                  ✅ Yes, I did
                </Btn>
                <Btn onClick={() => handlePrevMealCheck(false)} variant="warn" style={{ flex: 1 }}>
                  ❌ No, I skipped it
                </Btn>
              </div>
            </QuestionCard>
          </>
        );

      case 'prev_meal_skipped':
        return (
          <>
            {renderHistory()}
            {mealType === 'lunch' && <BreakfastSkippedCard />}
            {mealType !== 'lunch' && (
              <div className="animate-fadeUp" style={{
                background: '#111e2e',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                border: '1px solid #1a3350'
              }}>
                <div style={{ color: '#4a6280', fontSize: '13px' }}>
                  📝 No worries! Let's plan your {flowState.mealType} now.
                </div>
              </div>
            )}
            <Btn onClick={continueToPrevMealSkip} variant="primary" style={{ width: '100%' }}>
              Continue to {flowState.mealType} Planning →
            </Btn>
          </>
        );

      case 'prev_meal_what':
        return (
          <>
            {renderHistory()}
            <QuestionCard 
              step={2} total={5} 
              title="What did you have?" 
              question={`What did you have for ${getPrevMealName().toLowerCase()}?`}
              mealColor={mealColor}
            >
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePrevMealWhatSubmit()}
                  placeholder="e.g. Idli, Sambar, Coffee"
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    background: '#070d17',
                    border: '1px solid #1a3350',
                    borderRadius: '10px',
                    color: '#dde6f0',
                    fontSize: '14px'
                  }}
                />
                <VoiceBtn onTranscript={setInputText} addToast={addToast} />
              </div>
              <Btn onClick={handlePrevMealWhatSubmit} variant="primary" style={{ width: '100%' }}>
                Next →
              </Btn>
            </QuestionCard>
          </>
        );

      case 'prev_meal_qty':
        return (
          <>
            {renderHistory()}
            <QuestionCard 
              step={3} total={5} 
              title="How much?" 
              question="How much did you have? (e.g. 2 idlis, 1 cup rice, 300g)"
              mealColor={mealColor}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handlePrevMealQtySubmit()}
                  placeholder="e.g. 2 plates, 1 bowl"
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    background: '#070d17',
                    border: '1px solid #1a3350',
                    borderRadius: '10px',
                    color: '#dde6f0',
                    fontSize: '14px'
                  }}
                />
                <Btn onClick={handlePrevMealQtySubmit} variant="primary">Calculate</Btn>
              </div>
            </QuestionCard>
          </>
        );

      case 'prev_meal_summary': {
        const remainingCal = Math.round((metrics?.tdee || 2000) / 3) - (flowState.previousMealNutrients?.calories || 0);
        return (
          <>
            {renderHistory()}
            <PreviousMealSummary 
              mealName={getPrevMealName()}
              items={flowState.preMealAnswers.prevMealItems}
              nutrients={flowState.previousMealNutrients}
              remainingTarget={{ meal: flowState.mealType, calories: remainingCal > 0 ? remainingCal : 0 }}
              mealColor={mealColor}
            />
            <Btn onClick={continueFromSummary} variant="primary" style={{ width: '100%' }}>
              Continue to Ingredients →
            </Btn>
          </>
        );
      }

      // ===== EXTRA INGREDIENTS STAGE =====
      case 'extra_ings':
        return (
          <>
            {renderHistory()}
            <QuestionCard 
              step={stepInfo.current} 
              total={stepInfo.total} 
              title="Extra Ingredients" 
              question={`Here are your ${flowState.mealType.toLowerCase()} ingredients. Want to add anything else?`}
              mealColor={mealColor}
            >
              {/* Current ingredients */}
              <div style={{
                background: '#070d17',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '16px',
                border: '1px solid #1a3350'
              }}>
                <div style={{ color: '#4a6280', fontSize: '11px', marginBottom: '8px' }}>
                  Current ingredients:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {flowState.allIngredients.map((ing, i) => (
                    <span key={i} style={{
                      padding: '4px 10px',
                      background: `${mealColor}22`,
                      color: mealColor,
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}>
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Add more options */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <VoiceBtn onTranscript={handleVoiceTranscript} addToast={addToast} />
                <ImgBtn onImageSelect={handleImageResult} addToast={addToast} />
                <button
                  onClick={() => setShowIngredientPanel(!showIngredientPanel)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: '1px solid #1a3350',
                    background: '#070d17',
                    color: '#dde6f0',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  + Add More
                </button>
              </div>

              {/* Ingredient chips panel */}
              {showIngredientPanel && (
                <div style={{
                  background: '#070d17',
                  borderRadius: '10px',
                  padding: '12px',
                  marginBottom: '16px',
                  border: '1px solid #1a3350',
                  maxHeight: '150px',
                  overflowY: 'auto'
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {COMMON_INGREDIENTS.map(ing => (
                      <Chip
                        key={ing}
                        active={flowState.allIngredients.includes(ing)}
                        onClick={() => addExtraIngredient(ing)}
                        color={mealColor}
                      >
                        {ing}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              <Btn 
                onClick={generateRecipes} 
                variant="primary" 
                size="lg" 
                disabled={flowState.loading || flowState.allIngredients.length === 0}
                style={{ width: '100%' }}
              >
                {flowState.loading ? '🍳 Generating Recipes...' : `🌿 Generate ${flowState.mealType} Recipes →`}
              </Btn>
            </QuestionCard>
          </>
        );

      // ===== RECIPES STAGE =====
      case 'recipes': {
        const targets = getTargets();
        return (
          <>
            {renderHistory()}
            {flowState.recipes.length > 0 ? (
              flowState.recipes.map((recipe, index) => (
                <RecipeCard 
                  key={index}
                  recipe={recipe}
                  index={index}
                  mealColor={mealColor}
                  targets={targets}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#4a6280' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍳</div>
                <p>No recipes found. Try adding more ingredients.</p>
              </div>
            )}
          </>
        );
      }

      default:
        return flowState.loading ? <LoadingCard /> : null;
    }
  };

  const tabStyle = (isActive) => ({
    flex: 1,
    padding: '10px 8px',
    textAlign: 'center',
    cursor: 'pointer',
    borderBottom: `2px solid ${isActive ? mealColor : 'transparent'}`,
    color: isActive ? mealColor : '#4a6280',
    fontSize: '12px',
    fontWeight: isActive ? 600 : 500,
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{ minHeight: '100vh', background: '#070d17', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        background: '#0d1520',
        borderBottom: '1px solid #1a3350',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>🌿</span>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#dde6f0' }}>NutriAI</span>
          </div>
          <span style={{
            padding: '4px 10px',
            background: `${mealColor}22`,
            color: mealColor,
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600
          }}>
            {flowState.mealType}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <Btn variant="warn" size="sm" onClick={onEditProfile}>✏️ Profile</Btn>
          <Btn variant="ghost" size="sm" onClick={onBack}>← Meals</Btn>
          <Btn variant="danger" size="sm" onClick={onLogout}>Logout</Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        background: '#111e2e',
        borderBottom: '1px solid #1a3350'
      }}>
        {TABS.map(tab => (
          <div
            key={tab.id}
            style={tabStyle(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.id === 'recipes' && flowState.recipes.length > 0 && ` (${flowState.recipes.length})`}
          </div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '16px', paddingBottom: '140px' }}>
        {activeTab === 'chat' && (
          <>
            {renderFlowContent()}
            
            {/* Free query history */}
            {freeQueryHistory.map((item, idx) => (
              item.type === 'user' 
                ? <UserQueryCard key={idx} query={item.text} />
                : <AIAnswerCard key={idx} answer={item.text} />
            ))}
            
            <div ref={chatEndRef} />
          </>
        )}

        {activeTab === 'recipes' && (
          <>
            {flowState.recipes.length > 0 ? (
              flowState.recipes.map((recipe, index) => (
                <RecipeCard 
                  key={index}
                  recipe={recipe}
                  index={index}
                  mealColor={mealColor}
                  targets={getTargets()}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#4a6280' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🍳</div>
                <p>Complete the chat flow to generate recipes!</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'stats' && (
          <div>
            {/* Today's Intake vs Target - Circular Rings */}
            <div style={{
              background: '#111e2e',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #1a3350',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#dde6f0', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📊 Today's Intake vs Target
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                {[
                  { label: 'Calories', current: flowState.nutritionLog?.calories || 0, target: metrics?.tdee || 2106, color: '#4ade80', unit: 'kcal' },
                  { label: 'Protein', current: flowState.nutritionLog?.protein || 0, target: Math.round((metrics?.tdee || 2000) * 0.2 / 4) || 96, color: '#60a5fa', unit: 'g' },
                  { label: 'Carbs', current: flowState.nutritionLog?.carbs || 0, target: Math.round((metrics?.tdee || 2000) * 0.5 / 4) || 250, color: '#4ade80', unit: 'g' },
                  { label: 'Fat', current: flowState.nutritionLog?.fat || 0, target: Math.round((metrics?.tdee || 2000) * 0.3 / 9) || 70, color: '#fbbf24', unit: 'g' },
                  { label: 'Fiber', current: flowState.nutritionLog?.fiber || 0, target: 30, color: '#c084fc', unit: 'g' }
                ].map((item, idx) => {
                  const percentage = Math.min(100, Math.round((item.current / item.target) * 100));
                  const circumference = 2 * Math.PI * 32;
                  const strokeDashoffset = circumference - (percentage / 100) * circumference;
                  return (
                    <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                      <div style={{ position: 'relative', width: '70px', height: '70px', margin: '0 auto' }}>
                        <svg width="70" height="70" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="35" cy="35" r="32" stroke="#1a3350" strokeWidth="5" fill="none" />
                          <circle 
                            cx="35" cy="35" r="32" 
                            stroke={item.color} 
                            strokeWidth="5" 
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                          />
                        </svg>
                        <div style={{ 
                          position: 'absolute', 
                          top: '-4px', 
                          left: '50%', 
                          transform: 'translateX(-50%)',
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          background: item.color 
                        }} />
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#dde6f0'
                        }}>
                          {percentage}%
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: idx === 3 ? '#fbbf24' : idx === 4 ? '#c084fc' : '#4a6280', marginTop: '8px' }}>
                        {item.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Progress Bars */}
            <div style={{
              background: '#111e2e',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #1a3350',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#dde6f0', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📈 Progress Bars
              </h3>
              {[
                { label: 'Calories', current: flowState.nutritionLog?.calories || 0, target: metrics?.tdee || 2106, color: '#4ade80', unit: 'kcal' },
                { label: 'Protein', current: flowState.nutritionLog?.protein || 0, target: Math.round((metrics?.tdee || 2000) * 0.2 / 4) || 96, color: '#60a5fa', unit: 'g' },
                { label: 'Carbs', current: flowState.nutritionLog?.carbs || 0, target: Math.round((metrics?.tdee || 2000) * 0.5 / 4) || 250, color: '#4ade80', unit: 'g' },
                { label: 'Fat', current: flowState.nutritionLog?.fat || 0, target: Math.round((metrics?.tdee || 2000) * 0.3 / 9) || 70, color: '#fbbf24', unit: 'g' },
                { label: 'Fiber', current: flowState.nutritionLog?.fiber || 0, target: 30, color: '#c084fc', unit: 'g' }
              ].map((item, idx) => {
                const percentage = Math.min(100, Math.round((item.current / item.target) * 100));
                return (
                  <div key={idx} style={{ marginBottom: idx < 4 ? '16px' : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#dde6f0' }}>{item.label}</span>
                      <span style={{ fontSize: '12px', color: '#4a6280' }}>
                        {item.current}{item.unit}/{item.target}{item.unit}
                      </span>
                    </div>
                    <div style={{ 
                      height: '8px', 
                      background: '#0d1520', 
                      borderRadius: '4px', 
                      overflow: 'hidden' 
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${percentage}%`,
                        background: `linear-gradient(90deg, ${item.color}88, ${item.color})`,
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sustainability Score */}
            <div style={{
              background: 'linear-gradient(135deg, #0d2818 0%, #111e2e 100%)',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #166534'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#dde6f0', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🌍 Sustainability
                </h3>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#4ade80' }}>
                  {flowState.nutritionLog?.calories ? '7.4' : '0.0'}<span style={{ fontSize: '14px', color: '#4a6280' }}>/10</span>
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#4a6280', margin: 0, lineHeight: 1.5 }}>
                {flowState.nutritionLog?.calories 
                  ? 'Below-average carbon footprint 🌿. Seasonal vegetables save ~40% water. Plant-based swaps reduce CO₂ by ~1.8kg/meal.'
                  : 'Complete a meal to calculate sustainability score.'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#4a6280' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                <p>No meal history yet.</p>
              </div>
            ) : (
              history.map((entry, idx) => (
                <div key={idx} style={{
                  background: '#111e2e',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  border: '1px solid #1a3350'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#dde6f0' }}>
                    {entry.meal}
                  </div>
                  <div style={{ fontSize: '12px', color: '#4a6280' }}>
                    {entry.date} · {entry.nutriData?.calories || 0} kcal
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Query Box - Fixed at bottom */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        background: '#0d1520',
        borderTop: '1px solid #1a3350',
        padding: '12px 16px',
        zIndex: 100
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '8px',
          background: '#111e2e',
          borderRadius: '12px',
          padding: '6px 6px 6px 16px',
          border: '1px solid #1a3350'
        }}>
          {/* Input field */}
          <input
            type="text"
            value={freeQueryInput}
            onChange={(e) => setFreeQueryInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleFreeQuery(freeQueryInput)}
            placeholder="Ask about nutrients, portions..."
            style={{
              flex: 1,
              padding: '10px 0',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#dde6f0',
              fontSize: '14px'
            }}
          />
          
          {/* Pen/Voice button */}
          <button
            onClick={() => {
              // Could trigger voice or text mode
            }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: 'none',
              background: '#1a3350',
              color: '#4a6280',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
              <path d="M2 2l7.586 7.586"></path>
              <circle cx="11" cy="11" r="2"></circle>
            </svg>
          </button>
          
          {/* Camera button */}
          <ImgBtn 
            onImageSelect={handleImageResult} 
            addToast={addToast}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: 'none',
              background: '#1a3350',
              color: '#4a6280',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          />
          
          {/* Send button */}
          <button
            onClick={() => handleFreeQuery(freeQueryInput)}
            disabled={!freeQueryInput.trim()}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: '#4ade80',
              color: '#070d17',
              fontSize: '14px',
              fontWeight: 600,
              cursor: freeQueryInput.trim() ? 'pointer' : 'not-allowed',
              opacity: freeQueryInput.trim() ? 1 : 0.6
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisScreen;
