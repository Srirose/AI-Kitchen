/**
 * Anthropic Claude API Integration
 * Handles AI chat, recipe generation, and nutrient analysis
 */

const CLAUDE_API_KEY = 'YOUR_API_KEY_HERE'; // User should replace with their key
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';
const API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Send message to Claude API
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} - AI response
 */
export async function sendToClaude(messages, options = {}) {
  // Check if API key is set
  if (CLAUDE_API_KEY === 'YOUR_API_KEY_HERE') {
    // Return mock response for demo
    return getMockResponse(messages, options);
  }
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        messages: messages,
        system: options.systemPrompt || getDefaultSystemPrompt()
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return parseClaudeResponse(data.content[0].text);
  } catch (error) {
    console.error('Claude API Error:', error);
    return getMockResponse(messages, options);
  }
}

/**
 * Get default system prompt for nutrition assistant
 * @returns {string} - System prompt
 */
function getDefaultSystemPrompt() {
  return `You are NutriAI, an expert nutritionist and sustainable eating advisor. 

Your responses should be structured with these tags:
- RECIPE_N: for recipe suggestions (where N is 1, 2, or 3)
- NUTRIENTS: for nutritional breakdowns
- SUSTAINABILITY: for eco-score (0-10)
- ADVICE: for general nutrition advice

Always consider the user's health conditions, allergies, and dietary preferences.
Provide practical, actionable advice with specific ingredient recommendations.`;
}

/**
 * Parse Claude's structured response
 * @param {string} text - Raw response text
 * @returns {Object} - Parsed response
 */
function parseClaudeResponse(text) {
  const result = {
    text: text,
    recipes: [],
    nutrients: null,
    sustainability: null,
    advice: []
  };
  
  // Extract recipes
  const recipeRegex = /RECIPE_(\d+):\s*([\s\S]*?)(?=RECIPE_\d+:|NUTRIENTS:|SUSTAINABILITY:|ADVICE:|$)/g;
  let match;
  while ((match = recipeRegex.exec(text)) !== null) {
    result.recipes.push({
      number: parseInt(match[1]),
      content: match[2].trim()
    });
  }
  
  // Extract nutrients
  const nutrientsMatch = text.match(/NUTRIENTS:\s*([\s\S]*?)(?=RECIPE_\d+:|SUSTAINABILITY:|ADVICE:|$)/);
  if (nutrientsMatch) {
    result.nutrients = parseNutrients(nutrientsMatch[1]);
  }
  
  // Extract sustainability score
  const sustainabilityMatch = text.match(/SUSTAINABILITY:\s*(\d+)/);
  if (sustainabilityMatch) {
    result.sustainability = parseInt(sustainabilityMatch[1]);
  }
  
  // Extract advice
  const adviceMatch = text.match(/ADVICE:\s*([\s\S]*?)(?=RECIPE_\d+:|NUTRIENTS:|SUSTAINABILITY:|$)/);
  if (adviceMatch) {
    result.advice = adviceMatch[1].trim().split('\n').filter(line => line.trim());
  }
  
  return result;
}

/**
 * Parse nutrient string into structured object
 * @param {string} nutrientText - Nutrient text
 * @returns {Object} - Parsed nutrients
 */
function parseNutrients(nutrientText) {
  const nutrients = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0
  };
  
  const calorieMatch = nutrientText.match(/calories?:\s*(\d+)/i);
  if (calorieMatch) nutrients.calories = parseInt(calorieMatch[1]);
  
  const proteinMatch = nutrientText.match(/protein:\s*(\d+)g/i);
  if (proteinMatch) nutrients.protein = parseInt(proteinMatch[1]);
  
  const carbsMatch = nutrientText.match(/carbs?:\s*(\d+)g/i);
  if (carbsMatch) nutrients.carbs = parseInt(carbsMatch[1]);
  
  const fatMatch = nutrientText.match(/fat:\s*(\d+)g/i);
  if (fatMatch) nutrients.fat = parseInt(fatMatch[1]);
  
  const fiberMatch = nutrientText.match(/fiber:\s*(\d+)g/i);
  if (fiberMatch) nutrients.fiber = parseInt(fiberMatch[1]);
  
  return nutrients;
}

/**
 * Generate mock response for demo without API key
 * @param {Array} messages - User messages
 * @param {Object} options - Options
 * @returns {Object} - Mock response
 */
function getMockResponse(messages, options) {
  const lastMessage = messages[messages.length - 1]?.content || '';
  
  // Check if asking for recipes
  if (lastMessage.toLowerCase().includes('recipe') || lastMessage.toLowerCase().includes('meal')) {
    return {
      text: `Here are some recipe suggestions based on your profile:

RECIPE_1: Mediterranean Quinoa Bowl
Ingredients: quinoa, cucumber, tomatoes, olives, feta, olive oil, lemon
Instructions: Cook quinoa, chop vegetables, mix with dressing

RECIPE_2: Grilled Chicken Salad
Ingredients: chicken breast, mixed greens, avocado, walnuts, balsamic
Instructions: Grill chicken, toss with salad ingredients

RECIPE_3: Lentil Vegetable Soup
Ingredients: lentils, carrots, celery, onions, vegetable broth, herbs
Instructions: Sauté vegetables, add lentils and broth, simmer 30 min

NUTRIENTS:
calories: 450
protein: 28g
carbs: 52g
fat: 16g
fiber: 12g

SUSTAINABILITY: 8

ADVICE:
- These meals are rich in plant-based proteins
- Great for heart health with healthy fats
- High fiber content supports digestion`,
      recipes: [
        {
          number: 1,
          content: 'Mediterranean Quinoa Bowl\nIngredients: quinoa, cucumber, tomatoes, olives, feta, olive oil, lemon\nInstructions: Cook quinoa, chop vegetables, mix with dressing'
        },
        {
          number: 2,
          content: 'Grilled Chicken Salad\nIngredients: chicken breast, mixed greens, avocado, walnuts, balsamic\nInstructions: Grill chicken, toss with salad ingredients'
        },
        {
          number: 3,
          content: 'Lentil Vegetable Soup\nIngredients: lentils, carrots, celery, onions, vegetable broth, herbs\nInstructions: Sauté vegetables, add lentils and broth, simmer 30 min'
        }
      ],
      nutrients: {
        calories: 450,
        protein: 28,
        carbs: 52,
        fat: 16,
        fiber: 12
      },
      sustainability: 8,
      advice: [
        'These meals are rich in plant-based proteins',
        'Great for heart health with healthy fats',
        'High fiber content supports digestion'
      ]
    };
  }
  
  // Default chat response
  return {
    text: `I understand you're asking about: "${lastMessage}"

As your nutrition assistant, I can help you with:
- Personalized meal planning
- Recipe suggestions based on your dietary preferences
- Nutritional analysis of your meals
- Sustainability scoring for food choices

What would you like to know more about?`,
    recipes: [],
    nutrients: null,
    sustainability: null,
    advice: ['Consider tracking your daily water intake', 'Aim for variety in your vegetable choices']
  };
}

/**
 * Analyze ingredients and suggest recipes
 * @param {Array} ingredients - List of ingredients
 * @param {Object} profile - User profile
 * @returns {Promise<Object>} - AI analysis
 */
export async function analyzeIngredients(ingredients, profile) {
  const prompt = `I have these ingredients: ${ingredients.join(', ')}.
  
My profile:
- Goal: ${profile.goal}
- Diet: ${profile.dietPreference}
- Allergies: ${profile.allergies || 'None'}
- Conditions: ${profile.healthConditions || 'None'}

Please suggest recipes and provide nutritional analysis.
Use the structured format with RECIPE_1, RECIPE_2, NUTRIENTS, SUSTAINABILITY, and ADVICE tags.`;

  return sendToClaude([
    { role: 'user', content: prompt }
  ]);
}

/**
 * Get daily meal analysis
 * @param {Object} meals - All meals for the day
 * @param {Object} profile - User profile
 * @returns {Promise<Object>} - AI analysis
 */
export async function analyzeDailyMeals(meals, profile) {
  const mealDescriptions = Object.entries(meals).map(([type, meal]) => {
    return `${type}: ${meal.ingredients?.join(', ') || meal.description}`;
  }).join('\n');

  const prompt = `Analyze my daily meals:
${mealDescriptions}

My targets:
- Calories: ${profile.targets?.calorieTarget || 2000}
- Protein: ${profile.targets?.macros?.protein || 150}g
- Carbs: ${profile.targets?.macros?.carbs || 250}g
- Fat: ${profile.targets?.macros?.fat || 65}g

Provide feedback on my nutrition and suggestions for improvement.
Use NUTRIENTS and ADVICE tags.`;

  return sendToClaude([
    { role: 'user', content: prompt }
  ]);
}

/**
 * Detect ingredients from image description
 * @param {string} imageDescription - Description of the image
 * @returns {Promise<Object>} - Detected ingredients
 */
export async function detectIngredientsFromImage(imageDescription) {
  const prompt = `I see this in a food photo: "${imageDescription}"

Please identify the ingredients you can detect and estimate their quantities.
Return as a simple list: ingredient: estimated amount`;

  const response = await sendToClaude([
    { role: 'user', content: prompt }
  ]);
  
  // Parse ingredients from response
  const lines = response.text.split('\n').filter(line => line.includes(':'));
  const ingredients = lines.map(line => {
    const [name, amount] = line.split(':').map(s => s.trim());
    return { name, amount };
  });
  
  return { ingredients, raw: response.text };
}
