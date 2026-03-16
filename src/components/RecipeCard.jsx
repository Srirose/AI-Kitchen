import React, { useState } from 'react';
import Bar from './Bar';

const RecipeCard = ({ recipe, index = 0, mealColor = '#4ade80', targets = {} }) => {
  const [expanded, setExpanded] = useState(index === 0);

  const calories = recipe.calories || recipe.nutrients?.calories || 0;
  const protein = recipe.protein || recipe.nutrients?.protein || 0;
  const carbs = recipe.carbs || recipe.nutrients?.carbs || 0;
  const fat = recipe.fat || recipe.nutrients?.fat || 0;
  const fiber = recipe.fiber || recipe.nutrients?.fiber || 0;
  const vitamins = recipe.vitamins || 0;
  const eco = recipe.eco || 7;
  
  // Calculate calorie percentage vs target
  const targetCalories = targets.calorieTarget || 500;
  const caloriePercent = Math.min(Math.round((calories / targetCalories) * 100), 150);
  const isOverTarget = caloriePercent > 100;

  return (
    <div 
      className="animate-popIn" 
      style={{
        background: '#0d1520',
        borderRadius: '16px',
        border: `1.5px solid ${mealColor}44`,
        marginBottom: '16px',
        overflow: 'hidden',
        animationDelay: `${index * 0.1}s`
      }}
    >
      {/* Recipe Header - Clickable */}
      <div 
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: '14px 16px',
          background: `${mealColor}12`,
          borderBottom: expanded ? `1px solid ${mealColor}33` : 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: `${mealColor}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            🍲
          </div>
          <div>
            <div style={{ color: mealColor, fontWeight: 900, fontSize: '14px' }}>
              {recipe.name}
            </div>
            <div style={{ color: '#4a6280', fontSize: '10px', marginTop: '2px' }}>
              ⏱️ {recipe.prepTime || 15} min &nbsp;|&nbsp; 
              🔥 {calories} kcal &nbsp;|&nbsp; 
              👤 {recipe.servings || 1} serving(s)
            </div>
          </div>
        </div>
        <span style={{ color: '#4a6280', fontSize: '12px' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div style={{ padding: '14px 16px' }}>

          {/* Ingredients List */}
          <div style={{
            background: '#070d17',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '16px',
            border: '1px solid #1a3350'
          }}>
            <div style={{ 
              color: '#0ea5e9', 
              fontSize: '11px', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              📝 Ingredients Needed
            </div>
            {(recipe.ingredients || []).map((ing, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 0',
                borderBottom: i < (recipe.ingredients?.length || 0) - 1 ? '1px solid #1a335033' : 'none'
              }}>
                <span style={{ color: mealColor, fontSize: '10px' }}>◆</span>
                <span style={{ color: '#dde6f0', fontSize: '13px', flex: 1 }}>
                  {typeof ing === 'string' ? ing : ing.name}
                </span>
                {typeof ing === 'object' && ing.qty && (
                  <span style={{ color: '#4ade80', fontSize: '12px', fontWeight: 600, minWidth: '60px', textAlign: 'right' }}>
                    {ing.qty}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Procedure Steps */}
          {recipe.steps && recipe.steps.length > 0 && (
            <div style={{
              background: '#070d17',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '16px',
              border: '1px solid #1a3350'
            }}>
              <div style={{ 
                color: '#818cf8', 
                fontSize: '11px', 
                fontWeight: 800, 
                textTransform: 'uppercase', 
                letterSpacing: '1px', 
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                📋 How to Prepare
              </div>
              {recipe.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: `${mealColor}22`,
                    color: mealColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 900,
                    flexShrink: 0
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ 
                    color: '#dde6f0', 
                    fontSize: '13px', 
                    lineHeight: 1.6, 
                    paddingTop: '3px',
                    flex: 1
                  }}>
                    {step}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Time Badges */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {[
              ['⏱️', 'Prep Time', `${recipe.prepTime || 10} min`],
              ['🍳', 'Cook Time', `${recipe.cookTime || 15} min`],
              ['🕐', 'Total', `${(recipe.prepTime || 10) + (recipe.cookTime || 15)} min`]
            ].map(([icon, label, value]) => (
              <div key={label} style={{
                flex: 1,
                background: '#070d17',
                borderRadius: '9px',
                padding: '8px 6px',
                border: '1px solid #1a3350',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px' }}>{icon}</div>
                <div style={{ color: '#4a6280', fontSize: '8px', marginTop: '2px' }}>{label}</div>
                <div style={{ color: '#dde6f0', fontWeight: 800, fontSize: '11px' }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Nutrition Chart */}
          <div style={{
            background: '#070d17',
            borderRadius: '10px',
            padding: '11px 14px',
            border: '1px solid #1a3350'
          }}>
            <div style={{ 
              color: '#00ffb2', 
              fontSize: '10px', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              letterSpacing: '1px', 
              marginBottom: '10px' 
            }}>
              📊 Nutritional Values
            </div>

            {/* Dynamic Calorie vs Target Bar */}
            <div style={{
              background: isOverTarget ? '#f8717115' : `${mealColor}15`,
              borderRadius: '8px',
              padding: '10px 12px',
              marginBottom: '12px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ color: '#dde6f0', fontSize: '12px' }}>🔥 Calories</span>
                <span style={{ 
                  color: isOverTarget ? '#f87171' : mealColor, 
                  fontWeight: 900, 
                  fontSize: '16px' 
                }}>
                  {calories} kcal
                </span>
              </div>
              {/* Progress bar */}
              <div style={{
                height: '8px',
                background: '#1a3350',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '4px'
              }}>
                <div style={{
                  width: `${Math.min(caloriePercent, 100)}%`,
                  height: '100%',
                  background: isOverTarget 
                    ? 'linear-gradient(90deg, #f87171 0%, #ef4444 100%)'
                    : `linear-gradient(90deg, ${mealColor} 0%, #0ea5e9 100%)`,
                  borderRadius: '4px',
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <div style={{ 
                fontSize: '10px', 
                color: isOverTarget ? '#f87171' : '#4a6280',
                textAlign: 'right'
              }}>
                {caloriePercent}% of daily target
              </div>
            </div>

            {/* Macro Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Bar value={protein} max={targets.proteinTarget || 50} label="Protein" color="#f87171" height={6} />
              <Bar value={carbs} max={targets.carbsTarget || 200} label="Carbs" color="#f59e0b" height={6} />
              <Bar value={fat} max={targets.fatTarget || 80} label="Fat" color="#818cf8" height={6} />
              <Bar value={fiber} max={targets.fiberTarget || 30} label="Fiber" color="#4ade80" height={6} />
              {vitamins > 0 && (
                <Bar value={vitamins} max={100} label="Vitamins" color="#0ea5e9" height={6} />
              )}
            </div>

            {/* Eco Score */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '12px',
              padding: '8px 0',
              borderTop: '1px solid #1a3350'
            }}>
              <span style={{ fontSize: '14px' }}>🌱</span>
              <span style={{ color: '#4a6280', fontSize: '11px' }}>Eco Score:</span>
              <div style={{
                flex: 1,
                height: '6px',
                background: '#1a3350',
                borderRadius: '3px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${eco * 10}%`,
                  height: '100%',
                  background: '#4ade80',
                  borderRadius: '3px'
                }} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#4ade80' }}>
                {eco}/10
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCard;
