import json
import os
from typing import Dict, List, Optional
import random

class RecommendationEngine:
    def __init__(self):
        self.meal_database = self._load_meal_database()
    
    def _load_meal_database(self):
        """Load meal database with nutrition and sustainability info"""
        return [
            {
                "name": "Grilled Chicken Salad",
                "type": "lunch",
                "calories": 350,
                "protein": 35,
                "carbs": 15,
                "fat": 12,
                "sustainabilityScore": 75,
                "ingredients": ["chicken", "lettuce", "tomato", "cucumber", "olive oil"],
                "prepTime": 15,
                "tags": ["high-protein", "low-carb", "gluten-free"]
            },
            {
                "name": "Quinoa Buddha Bowl",
                "type": "lunch",
                "calories": 450,
                "protein": 15,
                "carbs": 65,
                "fat": 14,
                "sustainabilityScore": 92,
                "ingredients": ["quinoa", "chickpeas", "spinach", "avocado", "tahini"],
                "prepTime": 25,
                "tags": ["vegan", "high-fiber", "gluten-free"]
            },
            {
                "name": "Salmon with Roasted Vegetables",
                "type": "dinner",
                "calories": 520,
                "protein": 40,
                "carbs": 25,
                "fat": 28,
                "sustainabilityScore": 68,
                "ingredients": ["salmon", "broccoli", "carrot", "potato", "lemon"],
                "prepTime": 30,
                "tags": ["high-protein", "omega-3", "gluten-free"]
            },
            {
                "name": "Lentil Curry",
                "type": "dinner",
                "calories": 380,
                "protein": 18,
                "carbs": 55,
                "fat": 8,
                "sustainabilityScore": 95,
                "ingredients": ["lentils", "coconut milk", "tomato", "onion", "spices"],
                "prepTime": 35,
                "tags": ["vegan", "high-fiber", "gluten-free"]
            },
            {
                "name": "Oatmeal with Berries",
                "type": "breakfast",
                "calories": 320,
                "protein": 12,
                "carbs": 58,
                "fat": 6,
                "sustainabilityScore": 88,
                "ingredients": ["oats", "blueberries", "strawberries", "almond milk", "honey"],
                "prepTime": 10,
                "tags": ["vegetarian", "high-fiber"]
            },
            {
                "name": "Avocado Toast with Egg",
                "type": "breakfast",
                "calories": 380,
                "protein": 16,
                "carbs": 32,
                "fat": 22,
                "sustainabilityScore": 72,
                "ingredients": ["bread", "avocado", "egg", "tomato", "spinach"],
                "prepTime": 15,
                "tags": ["vegetarian", "high-protein"]
            },
            {
                "name": "Greek Yogurt Parfait",
                "type": "breakfast",
                "calories": 280,
                "protein": 20,
                "carbs": 35,
                "fat": 6,
                "sustainabilityScore": 70,
                "ingredients": ["yogurt", "granola", "banana", "honey", "nuts"],
                "prepTime": 5,
                "tags": ["vegetarian", "high-protein", "quick"]
            },
            {
                "name": "Vegetable Stir Fry",
                "type": "dinner",
                "calories": 340,
                "protein": 12,
                "carbs": 48,
                "fat": 12,
                "sustainabilityScore": 90,
                "ingredients": ["tofu", "broccoli", "peppers", "carrot", "rice", "soy sauce"],
                "prepTime": 20,
                "tags": ["vegan", "quick", "gluten-free"]
            },
            {
                "name": "Turkey and Vegetable Wrap",
                "type": "lunch",
                "calories": 420,
                "protein": 28,
                "carbs": 45,
                "fat": 14,
                "sustainabilityScore": 78,
                "ingredients": ["turkey", "wrap", "lettuce", "tomato", "hummus"],
                "prepTime": 10,
                "tags": ["high-protein", "quick"]
            },
            {
                "name": "Mediterranean Chickpea Salad",
                "type": "lunch",
                "calories": 380,
                "protein": 14,
                "carbs": 52,
                "fat": 14,
                "sustainabilityScore": 93,
                "ingredients": ["chickpeas", "cucumber", "tomato", "feta", "olives", "olive oil"],
                "prepTime": 15,
                "tags": ["vegetarian", "high-fiber", "gluten-free"]
            },
            {
                "name": "Beef and Vegetable Soup",
                "type": "dinner",
                "calories": 320,
                "protein": 25,
                "carbs": 28,
                "fat": 10,
                "sustainabilityScore": 55,
                "ingredients": ["beef", "carrot", "celery", "onion", "potato", "broth"],
                "prepTime": 45,
                "tags": ["high-protein", "comfort"]
            },
            {
                "name": "Smoothie Bowl",
                "type": "breakfast",
                "calories": 350,
                "protein": 10,
                "carbs": 65,
                "fat": 8,
                "sustainabilityScore": 85,
                "ingredients": ["banana", "berries", "spinach", "almond milk", "chia seeds"],
                "prepTime": 10,
                "tags": ["vegan", "raw", "gluten-free"]
            },
            {
                "name": "Tuna Salad Sandwich",
                "type": "lunch",
                "calories": 380,
                "protein": 30,
                "carbs": 35,
                "fat": 12,
                "sustainabilityScore": 65,
                "ingredients": ["tuna", "bread", "lettuce", "tomato", "mayonnaise"],
                "prepTime": 10,
                "tags": ["high-protein", "quick"]
            },
            {
                "name": "Pasta Primavera",
                "type": "dinner",
                "calories": 480,
                "protein": 16,
                "carbs": 72,
                "fat": 14,
                "sustainabilityScore": 82,
                "ingredients": ["pasta", "zucchini", "peppers", "tomato", "garlic", "olive oil"],
                "prepTime": 25,
                "tags": ["vegetarian", "comfort"]
            },
            {
                "name": "Apple with Almond Butter",
                "type": "snack",
                "calories": 200,
                "protein": 5,
                "carbs": 22,
                "fat": 12,
                "sustainabilityScore": 88,
                "ingredients": ["apple", "almond butter"],
                "prepTime": 2,
                "tags": ["vegan", "quick", "raw"]
            },
            {
                "name": "Hummus and Vegetables",
                "type": "snack",
                "calories": 180,
                "protein": 6,
                "carbs": 20,
                "fat": 10,
                "sustainabilityScore": 90,
                "ingredients": ["hummus", "carrot", "cucumber", "peppers"],
                "prepTime": 5,
                "tags": ["vegan", "quick", "gluten-free"]
            }
        ]
    
    def generate(self, user_profile: Dict, meal_type: Optional[str] = None, count: int = 5) -> List[Dict]:
        """
        Generate personalized meal recommendations
        Score = 0.4 * HealthScore + 0.4 * SustainabilityScore + 0.2 * ContextScore
        """
        candidates = self.meal_database
        
        if meal_type:
            candidates = [m for m in candidates if m["type"] == meal_type]
        
        scored_meals = []
        
        for meal in candidates:
            health_score = self._calculate_health_score(meal, user_profile)
            sustainability_score = meal["sustainabilityScore"]
            context_score = self._calculate_context_score(meal, user_profile)
            
            total_score = (
                0.4 * health_score +
                0.4 * sustainability_score +
                0.2 * context_score
            )
            
            scored_meals.append({
                **meal,
                "totalScore": round(total_score, 2),
                "healthScore": round(health_score, 2),
                "sustainabilityScore": round(sustainability_score, 2),
                "contextScore": round(context_score, 2)
            })
        
        scored_meals.sort(key=lambda x: x["totalScore"], reverse=True)
        
        return scored_meals[:count]
    
    def _calculate_health_score(self, meal: Dict, user_profile: Dict) -> float:
        """Calculate health score based on user goals"""
        score = 50.0
        
        goal = user_profile.get("fitnessGoal", "maintain")
        target_calories = user_profile.get("dailyCalorieTarget", 2000)
        meal_calories = meal["calories"]
        
        if goal == "lose_weight":
            if 300 <= meal_calories <= 450:
                score += 20
            elif meal_calories < 300:
                score += 10
            
            if meal["protein"] >= 20:
                score += 15
            
            if meal["fat"] <= 15:
                score += 10
        
        elif goal == "gain_muscle":
            if meal["protein"] >= 25:
                score += 25
            elif meal["protein"] >= 15:
                score += 15
            
            if meal_calories >= 400:
                score += 10
        
        elif goal == "improve_health":
            if meal["fiber"] >= 5:
                score += 15
            
            if meal["fat"] <= 15:
                score += 10
            
            if "high-fiber" in meal["tags"]:
                score += 10
        
        else:  # maintain
            if 350 <= meal_calories <= 550:
                score += 15
            
            if 15 <= meal["protein"] <= 35:
                score += 10
        
        allergies = user_profile.get("foodAllergies", [])
        for allergen in allergies:
            if any(allergen.lower() in ing.lower() for ing in meal["ingredients"]):
                score -= 50
        
        return min(100, max(0, score))
    
    def _calculate_context_score(self, meal: Dict, user_profile: Dict) -> float:
        """Calculate context score based on meal characteristics"""
        score = 50.0
        
        if meal["prepTime"] <= 15:
            score += 15
        elif meal["prepTime"] <= 25:
            score += 10
        
        if "quick" in meal["tags"]:
            score += 10
        
        if "high-protein" in meal["tags"]:
            score += 5
        
        if "gluten-free" in meal["tags"]:
            score += 5
        
        return min(100, score)
    
    def get_explanation(self, meal: Dict, user_profile: Dict) -> str:
        """Generate explanation for why this meal was recommended"""
        explanations = []
        
        if meal["sustainabilityScore"] >= 85:
            explanations.append("highly sustainable with low carbon footprint")
        
        goal = user_profile.get("fitnessGoal", "maintain")
        if goal == "lose_weight" and meal["calories"] <= 400:
            explanations.append("supports your weight loss goals")
        elif goal == "gain_muscle" and meal["protein"] >= 20:
            explanations.append("excellent protein content for muscle building")
        
        if meal["prepTime"] <= 15:
            explanations.append("quick and easy to prepare")
        
        if explanations:
            return f"Recommended because it's {', '.join(explanations)}."
        else:
            return "A balanced meal that fits your nutritional needs."
