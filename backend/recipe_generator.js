/**
 * Free Rule-Based Recipe Generator
 * Returns recipes in structured JSON format with <RECIPES> tags
 */

// Comprehensive Recipe Database
const RECIPE_DATABASE = [
  // Breakfast Recipes
  {
    id: 1,
    name: 'Masala Oats Porridge',
    keywords: ['oats', 'milk', 'banana'],
    prepTime: 5, cookTime: 10, servings: 1,
    calories: 280, protein: 12, carbs: 48, fat: 6, fiber: 6, vitamins: 65, eco: 8,
    ingredients: [
      { name: 'Oats', qty: '50g' },
      { name: 'Milk', qty: '200ml' },
      { name: 'Banana', qty: '1 medium' },
      { name: 'Honey', qty: '1 tbsp' }
    ],
    steps: [
      'Heat milk in a pan until it starts to simmer.',
      'Add oats and stir continuously for 3-4 minutes.',
      'Slice banana and add to the oats.',
      'Drizzle honey on top and serve warm.'
    ]
  },
  {
    id: 2,
    name: 'Vegetable Poha',
    keywords: ['poha', 'onion', 'potato', 'peas'],
    prepTime: 10, cookTime: 15, servings: 2,
    calories: 320, protein: 8, carbs: 55, fat: 8, fiber: 5, vitamins: 45, eco: 9,
    ingredients: [
      { name: 'Poha (flattened rice)', qty: '200g' },
      { name: 'Onion', qty: '1 medium, chopped' },
      { name: 'Potato', qty: '1 small, diced' },
      { name: 'Green peas', qty: '1/4 cup' },
      { name: 'Turmeric', qty: '1/4 tsp' },
      { name: 'Mustard seeds', qty: '1/2 tsp' }
    ],
    steps: [
      'Rinse poha in water and drain. Set aside.',
      'Heat oil, add mustard seeds until they splutter.',
      'Add diced potatoes and cook until golden.',
      'Add onions and peas, sauté for 3 minutes.',
      'Add turmeric and salt, mix well.',
      'Add poha, toss gently. Garnish with coriander.'
    ]
  },
  {
    id: 3,
    name: 'Egg Bhurji',
    keywords: ['egg', 'onion', 'tomato'],
    prepTime: 5, cookTime: 10, servings: 2,
    calories: 240, protein: 16, carbs: 8, fat: 16, fiber: 2, vitamins: 55, eco: 6,
    ingredients: [
      { name: 'Eggs', qty: '3 large' },
      { name: 'Onion', qty: '1 medium, chopped' },
      { name: 'Tomato', qty: '1 medium, chopped' },
      { name: 'Green chilli', qty: '1, finely chopped' },
      { name: 'Coriander leaves', qty: '2 tbsp' }
    ],
    steps: [
      'Heat oil in a pan, sauté onions until translucent.',
      'Add tomatoes and green chilli, cook for 2 minutes.',
      'Break eggs into the pan, scramble immediately.',
      'Cook on medium heat, stirring continuously.',
      'Garnish with fresh coriander and serve hot.'
    ]
  },
  // Lunch Recipes
  {
    id: 4,
    name: 'Dal Tadka',
    keywords: ['lentils', 'dal', 'onion', 'tomato', 'garlic'],
    prepTime: 10, cookTime: 25, servings: 3,
    calories: 220, protein: 14, carbs: 35, fat: 5, fiber: 10, vitamins: 60, eco: 9,
    ingredients: [
      { name: 'Toor dal', qty: '1 cup' },
      { name: 'Onion', qty: '1 large, sliced' },
      { name: 'Tomato', qty: '2 medium, pureed' },
      { name: 'Garlic', qty: '4 cloves, minced' },
      { name: 'Cumin seeds', qty: '1 tsp' },
      { name: 'Turmeric', qty: '1/2 tsp' },
      { name: 'Red chilli', qty: '2 dried' }
    ],
    steps: [
      'Wash dal and pressure cook with turmeric for 3 whistles.',
      'Heat ghee in a pan, add cumin seeds.',
      'Add garlic and sauté until golden.',
      'Add onions and cook until caramelized.',
      'Pour tomato puree, cook for 5 minutes.',
      'Add cooked dal, simmer for 10 minutes. Serve with rice.'
    ]
  },
  {
    id: 5,
    name: 'Chicken Curry',
    keywords: ['chicken', 'onion', 'tomato', 'ginger', 'garlic'],
    prepTime: 15, cookTime: 30, servings: 4,
    calories: 380, protein: 32, carbs: 12, fat: 22, fiber: 3, vitamins: 50, eco: 5,
    ingredients: [
      { name: 'Chicken', qty: '500g, cut into pieces' },
      { name: 'Onion', qty: '2 large, sliced' },
      { name: 'Tomato', qty: '3 medium, pureed' },
      { name: 'Ginger-garlic paste', qty: '2 tbsp' },
      { name: 'Garam masala', qty: '1 tsp' },
      { name: 'Yogurt', qty: '1/2 cup' }
    ],
    steps: [
      'Marinate chicken with yogurt and spices for 30 minutes.',
      'Heat oil, fry onions until deep golden.',
      'Add ginger-garlic paste, sauté for 2 minutes.',
      'Add tomato puree, cook until oil separates.',
      'Add marinated chicken, cook covered for 20 minutes.',
      'Finish with garam masala and fresh coriander.'
    ]
  },
  {
    id: 6,
    name: 'Palak Paneer',
    keywords: ['paneer', 'spinach', 'onion', 'tomato'],
    prepTime: 15, cookTime: 20, servings: 3,
    calories: 320, protein: 18, carbs: 14, fat: 22, fiber: 5, vitamins: 85, eco: 7,
    ingredients: [
      { name: 'Paneer', qty: '250g, cubed' },
      { name: 'Spinach', qty: '400g, blanched' },
      { name: 'Onion', qty: '1 medium' },
      { name: 'Tomato', qty: '1 medium' },
      { name: 'Cream', qty: '2 tbsp' },
      { name: 'Garam masala', qty: '1/2 tsp' }
    ],
    steps: [
      'Blanch spinach in boiling water, then blend to a paste.',
      'Sauté onions until golden, add tomatoes.',
      'Add spinach puree and cook for 5 minutes.',
      'Add paneer cubes, simmer for 5 minutes.',
      'Finish with cream and garam masala. Serve hot.'
    ]
  },
  {
    id: 7,
    name: 'Vegetable Biryani',
    keywords: ['rice', 'carrot', 'peas', 'potato', 'onion'],
    prepTime: 20, cookTime: 35, servings: 4,
    calories: 380, protein: 10, carbs: 65, fat: 10, fiber: 6, vitamins: 55, eco: 8,
    ingredients: [
      { name: 'Basmati rice', qty: '2 cups' },
      { name: 'Mixed vegetables', qty: '2 cups' },
      { name: 'Onion', qty: '2 large, sliced' },
      { name: 'Yogurt', qty: '1/2 cup' },
      { name: 'Biryani masala', qty: '2 tbsp' },
      { name: 'Saffron', qty: 'few strands' }
    ],
    steps: [
      'Soak rice for 30 minutes, then parboil.',
      'Fry onions until crispy and golden.',
      'Mix vegetables with yogurt and spices.',
      'Layer rice and vegetable mixture in a pot.',
      'Add saffron milk, cover and cook on dum for 25 minutes.',
      'Rest for 5 minutes before serving.'
    ]
  },
  {
    id: 8,
    name: 'Fish Curry',
    keywords: ['fish', 'onion', 'tomato', 'coconut'],
    prepTime: 10, cookTime: 20, servings: 3,
    calories: 290, protein: 28, carbs: 10, fat: 16, fiber: 2, vitamins: 65, eco: 5,
    ingredients: [
      { name: 'Fish fillets', qty: '400g' },
      { name: 'Onion', qty: '1 large' },
      { name: 'Tomato', qty: '2 medium' },
      { name: 'Coconut milk', qty: '200ml' },
      { name: 'Curry leaves', qty: '10-12' },
      { name: 'Turmeric', qty: '1/2 tsp' }
    ],
    steps: [
      'Marinate fish with turmeric and salt.',
      'Sauté onions with curry leaves until soft.',
      'Add tomatoes and cook until mushy.',
      'Pour coconut milk, bring to simmer.',
      'Add fish pieces, cook covered for 10 minutes.',
      'Serve with steamed rice.'
    ]
  },
  // Dinner Recipes
  {
    id: 9,
    name: 'Chapati with Aloo Sabzi',
    keywords: ['wheat', 'potato', 'onion', 'tomato'],
    prepTime: 20, cookTime: 25, servings: 3,
    calories: 340, protein: 8, carbs: 58, fat: 10, fiber: 6, vitamins: 40, eco: 9,
    ingredients: [
      { name: 'Whole wheat flour', qty: '2 cups' },
      { name: 'Potato', qty: '3 medium, cubed' },
      { name: 'Onion', qty: '1 large' },
      { name: 'Tomato', qty: '1 medium' },
      { name: 'Cumin seeds', qty: '1 tsp' },
      { name: 'Coriander', qty: 'fresh, for garnish' }
    ],
    steps: [
      'Knead flour with water to make soft dough. Rest 15 minutes.',
      'Boil potatoes until tender, set aside.',
      'Sauté cumin in oil, add onions and cook.',
      'Add tomatoes, spices, and potatoes. Mash slightly.',
      'Roll dough into chapatis, cook on tawa.',
      'Serve hot chapatis with aloo sabzi.'
    ]
  },
  {
    id: 10,
    name: 'Quinoa Buddha Bowl',
    keywords: ['quinoa', 'broccoli', 'carrot', 'chickpeas'],
    prepTime: 15, cookTime: 20, servings: 2,
    calories: 420, protein: 16, carbs: 52, fat: 18, fiber: 10, vitamins: 80, eco: 9,
    ingredients: [
      { name: 'Quinoa', qty: '1 cup' },
      { name: 'Broccoli', qty: '1 cup, florets' },
      { name: 'Carrot', qty: '1 medium, sliced' },
      { name: 'Chickpeas', qty: '1/2 cup, cooked' },
      { name: 'Tahini', qty: '2 tbsp' },
      { name: 'Lemon juice', qty: '1 tbsp' }
    ],
    steps: [
      'Cook quinoa according to package instructions.',
      'Roast broccoli and carrots at 400°F for 15 minutes.',
      'Warm chickpeas with a pinch of cumin.',
      'Mix tahini with lemon juice for dressing.',
      'Assemble bowl with quinoa, vegetables, and chickpeas.',
      'Drizzle dressing and serve.'
    ]
  }
];

// Find matching recipes based on ingredients
function findRecipes(ingredients, count = 3) {
  const ingredientLower = ingredients.map(i => i.toLowerCase());
  
  const scored = RECIPE_DATABASE.map(recipe => {
    const keywords = recipe.keywords.map(k => k.toLowerCase());
    let score = 0;
    
    ingredientLower.forEach(ing => {
      keywords.forEach(key => {
        if (ing.includes(key) || key.includes(ing)) {
          score += 2;
        }
      });
    });
    
    return { ...recipe, score };
  });
  
  scored.sort((a, b) => b.score - a.score);
  
  // Return top matches, or fallback to first N if no matches
  const matches = scored.filter(r => r.score > 0).slice(0, count);
  if (matches.length < count) {
    const remaining = RECIPE_DATABASE
      .filter(r => !matches.find(m => m.id === r.id))
      .slice(0, count - matches.length);
    matches.push(...remaining);
  }
  
  return matches.slice(0, count);
}

// Generate structured response with <RECIPES> tags
function generateRecipeResponse(ingredients, mealType, servings = 1) {
  const recipes = findRecipes(ingredients, 3);
  
  // Scale nutrients by servings
  const scaledRecipes = recipes.map(recipe => ({
    name: recipe.name,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: servings,
    calories: Math.round(recipe.calories * servings),
    protein: Math.round(recipe.protein * servings),
    carbs: Math.round(recipe.carbs * servings),
    fat: Math.round(recipe.fat * servings),
    fiber: Math.round(recipe.fiber * servings),
    vitamins: recipe.vitamins,
    eco: recipe.eco,
    ingredients: recipe.ingredients,
    steps: recipe.steps
  }));
  
  // Calculate total nutrients
  const totalNutrients = scaledRecipes[0] || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  
  // Build response with <RECIPES> tags
  let response = `Here are ${scaledRecipes.length} delicious ${mealType} recipes for you!\n\n`;
  response += `<RECIPES>\n${JSON.stringify(scaledRecipes, null, 2)}\n</RECIPES>\n\n`;
  response += `NUTRIENTS: calories=${totalNutrients.calories}, protein=${totalNutrients.protein}, carbs=${totalNutrients.carbs}, fat=${totalNutrients.fat}, fiber=${totalNutrients.fiber}`;
  
  return {
    reply: response,
    recipes: scaledRecipes,
    nutrients: totalNutrients
  };
}

// Generate chat response based on user query
function generateChatResponse(messages, profile, mealPlan) {
  const lastMessage = messages[messages.length - 1];
  const content = (lastMessage?.content || '').toLowerCase();
  const ingredients = mealPlan?.ingredients || [];
  const mealType = mealPlan?.meal || 'meal';
  const servings = mealPlan?.servings || 1;
  
  // Check for specific queries
  if (content.includes('calorie') || content.includes('calories')) {
    const recipes = findRecipes(ingredients, 1);
    const cal = recipes[0]?.calories || 350;
    return {
      reply: `Based on your ${mealType} with ${ingredients.join(', ')}, the estimated calories are approximately ${cal} kcal per serving.\n\nNUTRIENTS: calories=${cal}, protein=${recipes[0]?.protein || 15}, carbs=${recipes[0]?.carbs || 45}, fat=${recipes[0]?.fat || 10}, fiber=${recipes[0]?.fiber || 5}`
    };
  }
  
  if (content.includes('healthy') || content.includes('healthier')) {
    return {
      reply: `To make your ${mealType} healthier:\n\n• Use less oil/ghee during cooking\n• Add more vegetables for fiber\n• Use whole grains instead of refined\n• Reduce salt intake\n• Add a side of fresh salad\n\nNUTRIENTS: calories=320, protein=18, carbs=42, fat=8, fiber=10`
    };
  }
  
  if (content.includes('eco') || content.includes('sustainable')) {
    return {
      reply: `Your meal has an estimated eco-score of 7/10.\n\nTo improve sustainability:\n• Use locally sourced ingredients\n• Reduce meat consumption\n• Choose seasonal vegetables\n• Minimize food waste\n• Consider plant-based proteins\n\nNUTRIENTS: calories=350, protein=14, carbs=48, fat=10, fiber=8`
    };
  }
  
  if (content.includes('vitamin') || content.includes('vitamins')) {
    return {
      reply: `Your ${mealType} provides good vitamin content:\n\n• Vitamin A: Good for eyes & skin\n• Vitamin C: Immunity booster\n• Vitamin B: Energy metabolism\n• Iron: Blood health\n• Calcium: Bone strength\n\nNUTRIENTS: calories=340, protein=16, carbs=45, fat=12, fiber=7`
    };
  }
  
  // Default: generate recipes
  return generateRecipeResponse(ingredients, mealType, servings);
}

// Calculate nutrition for previous meal items
function calculatePreviousMealNutrition(items, quantity) {
  // Simple estimation based on common foods
  const itemLower = items.toLowerCase();
  let calories = 200, protein = 8, carbs = 35, fat = 6, fiber = 3;
  
  if (itemLower.includes('idli') || itemLower.includes('dosa')) {
    calories = 150; protein = 4; carbs = 28; fat = 3; fiber = 2;
  } else if (itemLower.includes('paratha') || itemLower.includes('roti')) {
    calories = 180; protein = 5; carbs = 30; fat = 6; fiber = 3;
  } else if (itemLower.includes('oats') || itemLower.includes('porridge')) {
    calories = 220; protein = 8; carbs = 40; fat = 4; fiber = 5;
  } else if (itemLower.includes('egg')) {
    calories = 140; protein = 12; carbs = 2; fat = 10; fiber = 0;
  } else if (itemLower.includes('rice')) {
    calories = 200; protein = 4; carbs = 44; fat = 1; fiber = 1;
  }
  
  // Parse quantity multiplier
  const qtyMatch = quantity?.match(/(\d+)/);
  const multiplier = qtyMatch ? parseInt(qtyMatch[1]) : 1;
  
  return {
    calories: calories * multiplier,
    protein: protein * multiplier,
    carbs: carbs * multiplier,
    fat: fat * multiplier,
    fiber: fiber * multiplier
  };
}

module.exports = {
  findRecipes,
  generateRecipeResponse,
  generateChatResponse,
  calculatePreviousMealNutrition
};
