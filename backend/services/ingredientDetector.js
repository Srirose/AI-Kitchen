require("dotenv").config();
const FormData = require("form-data");

// API configurations
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.EDAMAM_API_KEY;

const SPOONACULAR_BASE_URL = "https://api.spoonacular.com/food";
const EDAMAM_BASE_URL = "https://api.edamam.com/api/food-database/v2/parser";

/**
 * Detect ingredients from image using Spoonacular API
 * @param {string} base64Image - Base64 encoded image
 * @returns {Promise<Object>} - Detected ingredients
 */
async function detectWithSpoonacular(base64Image) {
  try {
    if (!SPOONACULAR_API_KEY) {
      throw new Error("Spoonacular API key not configured");
    }

    // Convert base64 to buffer and create form data
    const imageBuffer = Buffer.from(base64Image, 'base64');
    const formData = new FormData();
    formData.append('file', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg'
    });
    formData.append('apiKey', SPOONACULAR_API_KEY);

    // Call Spoonacular food classification API
    const response = await fetch("https://api.spoonacular.com/food/classify", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Spoonacular API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract ingredients from classification
    const ingredients = [];
    if (data.category) {
      ingredients.push({
        name: data.category,
        confidence: data.probability || 0.8,
        source: 'spoonacular'
      });
    }

    return {
      ingredients,
      count: ingredients.length,
      model: 'Spoonacular Food Classification'
    };

  } catch (error) {
    console.error("Spoonacular detection error:", error.message);
    throw error;
  }
}

/**
 * Search ingredients by text using Edamam API
 * @param {string} ingredientText - Ingredient description
 * @returns {Promise<Object>} - Matched ingredients
 */
async function searchWithEdamam(ingredientText) {
  try {
    if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
      throw new Error("Edamam API credentials not configured");
    }

    const url = new URL(EDAMAM_BASE_URL);
    url.searchParams.append('app_id', EDAMAM_APP_ID);
    url.searchParams.append('app_key', EDAMAM_APP_KEY);
    url.searchParams.append('ingr', ingredientText);

    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Edamam API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract ingredients from parsed results
    const ingredients = (data.parsed || []).map(item => ({
      name: item.food.label || item.food.foodId,
      confidence: 0.9,
      nutrients: item.food.nutrients,
      category: item.food.category,
      categoryLabel: item.food.categoryLabel,
      source: 'edamam'
    }));

    return {
      ingredients,
      count: ingredients.length,
      hints: data.hints?.length || 0,
      model: 'Edamam Food Database'
    };

  } catch (error) {
    console.error("Edamam search error:", error.message);
    throw error;
  }
}

/**
 * Analyze recipe with ingredients using Edamam
 * @param {Array} ingredients - List of ingredients
 * @returns {Promise<Object>} - Nutritional analysis
 */
async function analyzeRecipeWithEdamam(ingredients) {
  try {
    if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
      throw new Error("Edamam API credentials not configured");
    }

    const url = new URL("https://api.edamam.com/api/nutrition-details");
    url.searchParams.append('app_id', EDAMAM_APP_ID);
    url.searchParams.append('app_key', EDAMAM_APP_KEY);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ingredients: ingredients.map(name => ({ quantity: 1, measure: null, food: name }))
      })
    });

    if (!response.ok) {
      throw new Error(`Edamam nutrition API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      calories: data.calories,
      totalWeight: data.totalWeight,
      dietLabels: data.dietLabels,
      healthLabels: data.healthLabels,
      nutrients: data.totalNutrients,
      daily: data.totalDaily
    };

  } catch (error) {
    console.error("Edamam nutrition analysis error:", error.message);
    throw error;
  }
}

/**
 * Smart ingredient detection with fallback
 * Tries multiple APIs in order: Spoonacular -> Edamam
 * @param {string} base64Image - Base64 encoded image
 * @param {string} detectedText - Optional text description from YOLO or other source
 * @returns {Promise<Object>} - Best result from available APIs
 */
async function detectIngredientsSmart(base64Image, detectedText = null) {
  const results = {};
  const errors = [];

  // Try Spoonacular first for image classification
  if (SPOONACULAR_API_KEY) {
    try {
      results.spoonacular = await detectWithSpoonacular(base64Image);
      if (results.spoonacular.ingredients.length > 0) {
        return {
          ...results.spoonacular,
          primarySource: 'spoonacular'
        };
      }
    } catch (error) {
      errors.push(`Spoonacular: ${error.message}`);
    }
  }

  // If we have detected text from YOLO, use Edamam for enrichment
  if (detectedText && (EDAMAM_APP_ID && EDAMAM_APP_KEY)) {
    try {
      results.edamam = await searchWithEdamam(detectedText);
      if (results.edamam.ingredients.length > 0) {
        return {
          ...results.edamam,
          primarySource: 'edamam',
          basedOn: detectedText
        };
      }
    } catch (error) {
      errors.push(`Edamam: ${error.message}`);
    }
  }

  // If no API succeeded, return empty result
  return {
    ingredients: [],
    count: 0,
    message: errors.length > 0 
      ? `All APIs failed: ${errors.join('; ')}` 
      : 'No ingredients detected',
    model: 'fallback'
  };
}

module.exports = {
  detectWithSpoonacular,
  searchWithEdamam,
  analyzeRecipeWithEdamam,
  detectIngredientsSmart
};
