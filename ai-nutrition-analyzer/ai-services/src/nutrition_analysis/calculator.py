import json
import os
from typing import Dict

class NutritionCalculator:
    def __init__(self):
        self.nutrition_db = self._load_nutrition_database()
    
    def _load_nutrition_database(self):
        """Load nutrition database"""
        default_db = {
            "apple": {"calories": 52, "protein": 0.3, "carbohydrates": 14, "fat": 0.2, "fiber": 2.4},
            "banana": {"calories": 89, "protein": 1.1, "carbohydrates": 23, "fat": 0.3, "fiber": 2.6},
            "orange": {"calories": 47, "protein": 0.9, "carbohydrates": 12, "fat": 0.1, "fiber": 2.4},
            "grape": {"calories": 69, "protein": 0.7, "carbohydrates": 18, "fat": 0.2, "fiber": 0.9},
            "strawberry": {"calories": 32, "protein": 0.7, "carbohydrates": 7.7, "fat": 0.3, "fiber": 2},
            "blueberry": {"calories": 57, "protein": 0.7, "carbohydrates": 14, "fat": 0.3, "fiber": 2.4},
            "watermelon": {"calories": 30, "protein": 0.6, "carbohydrates": 8, "fat": 0.2, "fiber": 0.4},
            "peach": {"calories": 39, "protein": 0.9, "carbohydrates": 10, "fat": 0.3, "fiber": 1.5},
            "pear": {"calories": 57, "protein": 0.4, "carbohydrates": 15, "fat": 0.1, "fiber": 3.1},
            "mango": {"calories": 60, "protein": 0.8, "carbohydrates": 15, "fat": 0.4, "fiber": 1.6},
            "pineapple": {"calories": 50, "protein": 0.5, "carbohydrates": 13, "fat": 0.1, "fiber": 1.4},
            "carrot": {"calories": 41, "protein": 0.9, "carbohydrates": 10, "fat": 0.2, "fiber": 2.8},
            "broccoli": {"calories": 34, "protein": 2.8, "carbohydrates": 7, "fat": 0.4, "fiber": 2.6},
            "spinach": {"calories": 23, "protein": 2.9, "carbohydrates": 3.6, "fat": 0.4, "fiber": 2.2},
            "lettuce": {"calories": 15, "protein": 1.4, "carbohydrates": 2.9, "fat": 0.2, "fiber": 1.3},
            "tomato": {"calories": 18, "protein": 0.9, "carbohydrates": 3.9, "fat": 0.2, "fiber": 1.2},
            "cucumber": {"calories": 15, "protein": 0.7, "carbohydrates": 3.6, "fat": 0.1, "fiber": 0.5},
            "pepper": {"calories": 20, "protein": 0.9, "carbohydrates": 4.6, "fat": 0.2, "fiber": 1.7},
            "onion": {"calories": 40, "protein": 1.1, "carbohydrates": 9, "fat": 0.1, "fiber": 1.7},
            "potato": {"calories": 77, "protein": 2, "carbohydrates": 17, "fat": 0.1, "fiber": 2.2},
            "corn": {"calories": 86, "protein": 3.2, "carbohydrates": 19, "fat": 1.2, "fiber": 2.7},
            "peas": {"calories": 81, "protein": 5, "carbohydrates": 14, "fat": 0.4, "fiber": 5.7},
            "chicken": {"calories": 165, "protein": 31, "carbohydrates": 0, "fat": 3.6, "fiber": 0},
            "beef": {"calories": 250, "protein": 26, "carbohydrates": 0, "fat": 15, "fiber": 0},
            "pork": {"calories": 242, "protein": 27, "carbohydrates": 0, "fat": 14, "fiber": 0},
            "fish": {"calories": 206, "protein": 22, "carbohydrates": 0, "fat": 12, "fiber": 0},
            "salmon": {"calories": 208, "protein": 20, "carbohydrates": 0, "fat": 13, "fiber": 0},
            "tuna": {"calories": 132, "protein": 28, "carbohydrates": 0, "fat": 1, "fiber": 0},
            "shrimp": {"calories": 99, "protein": 24, "carbohydrates": 0.2, "fat": 0.3, "fiber": 0},
            "egg": {"calories": 155, "protein": 13, "carbohydrates": 1.1, "fat": 11, "fiber": 0},
            "milk": {"calories": 42, "protein": 3.4, "carbohydrates": 5, "fat": 1, "fiber": 0},
            "cheese": {"calories": 402, "protein": 25, "carbohydrates": 1.3, "fat": 33, "fiber": 0},
            "yogurt": {"calories": 59, "protein": 10, "carbohydrates": 3.6, "fat": 0.4, "fiber": 0},
            "butter": {"calories": 717, "protein": 0.9, "carbohydrates": 0.1, "fat": 81, "fiber": 0},
            "rice": {"calories": 130, "protein": 2.7, "carbohydrates": 28, "fat": 0.3, "fiber": 0.4},
            "pasta": {"calories": 131, "protein": 5, "carbohydrates": 25, "fat": 1.1, "fiber": 1.8},
            "bread": {"calories": 265, "protein": 9, "carbohydrates": 49, "fat": 3.2, "fiber": 2.7},
            "noodles": {"calories": 138, "protein": 4.5, "carbohydrates": 25, "fat": 2.1, "fiber": 1.2},
            "oats": {"calories": 389, "protein": 16.9, "carbohydrates": 66, "fat": 6.9, "fiber": 10.6},
            "quinoa": {"calories": 120, "protein": 4.4, "carbohydrates": 21, "fat": 1.9, "fiber": 2.8},
            "pizza": {"calories": 266, "protein": 11, "carbohydrates": 33, "fat": 10, "fiber": 2.3},
            "burger": {"calories": 295, "protein": 17, "carbohydrates": 30, "fat": 12, "fiber": 1.6},
            "sandwich": {"calories": 250, "protein": 12, "carbohydrates": 28, "fat": 9, "fiber": 2},
            "taco": {"calories": 226, "protein": 12, "carbohydrates": 20, "fat": 11, "fiber": 3},
            "burrito": {"calories": 290, "protein": 12, "carbohydrates": 35, "fat": 10, "fiber": 5},
            "sushi": {"calories": 143, "protein": 5, "carbohydrates": 28, "fat": 1.5, "fiber": 0.8},
            "salad": {"calories": 33, "protein": 2.9, "carbohydrates": 5, "fat": 0.5, "fiber": 2.8},
            "soup": {"calories": 42, "protein": 2.5, "carbohydrates": 5, "fat": 1.5, "fiber": 1},
            "cake": {"calories": 371, "protein": 3.5, "carbohydrates": 53, "fat": 15, "fiber": 1.2},
            "cookie": {"calories": 502, "protein": 7, "carbohydrates": 64, "fat": 25, "fiber": 2.3},
            "chocolate": {"calories": 546, "protein": 4.9, "carbohydrates": 61, "fat": 31, "fiber": 7},
            "ice cream": {"calories": 207, "protein": 3.5, "carbohydrates": 24, "fat": 11, "fiber": 0.7},
            "pie": {"calories": 237, "protein": 2.5, "carbohydrates": 35, "fat": 10, "fiber": 1.2},
            "donut": {"calories": 452, "protein": 4.5, "carbohydrates": 51, "fat": 25, "fiber": 1.5},
            "muffin": {"calories": 377, "protein": 6, "carbohydrates": 53, "fat": 16, "fiber": 2},
            "coffee": {"calories": 2, "protein": 0.3, "carbohydrates": 0, "fat": 0, "fiber": 0},
            "tea": {"calories": 1, "protein": 0, "carbohydrates": 0.2, "fat": 0, "fiber": 0},
            "juice": {"calories": 45, "protein": 0.7, "carbohydrates": 11, "fat": 0.2, "fiber": 0.2},
            "soda": {"calories": 41, "protein": 0, "carbohydrates": 10.6, "fat": 0, "fiber": 0},
            "water": {"calories": 0, "protein": 0, "carbohydrates": 0, "fat": 0, "fiber": 0},
            "oil": {"calories": 884, "protein": 0, "carbohydrates": 0, "fat": 100, "fiber": 0},
            "sugar": {"calories": 387, "protein": 0, "carbohydrates": 100, "fat": 0, "fiber": 0},
            "salt": {"calories": 0, "protein": 0, "carbohydrates": 0, "fat": 0, "fiber": 0},
            "vinegar": {"calories": 18, "protein": 0, "carbohydrates": 0.9, "fat": 0, "fiber": 0},
            "mixed meal": {"calories": 500, "protein": 20, "carbohydrates": 50, "fat": 20, "fiber": 5}
        }
        return default_db
    
    def get_nutrition(self, food_name: str, quantity_grams: float = 100) -> Dict:
        """
        Get nutrition information for a food item
        """
        food_name = food_name.lower().strip()
        
        if food_name in self.nutrition_db:
            nutrition = self.nutrition_db[food_name].copy()
        else:
            nutrition = self._estimate_nutrition(food_name)
        
        multiplier = quantity_grams / 100
        
        return {
            "calories": round(nutrition["calories"] * multiplier, 1),
            "protein": round(nutrition["protein"] * multiplier, 2),
            "carbohydrates": round(nutrition["carbohydrates"] * multiplier, 2),
            "fat": round(nutrition["fat"] * multiplier, 2),
            "fiber": round(nutrition["fiber"] * multiplier, 2)
        }
    
    def _estimate_nutrition(self, food_name: str) -> Dict:
        """Estimate nutrition for unknown foods based on category"""
        
        fruit_keywords = ["fruit", "berry", "apple", "banana", "orange", "grape", "melon"]
        vegetable_keywords = ["vegetable", "green", "leaf", "root", "salad"]
        meat_keywords = ["meat", "steak", "roast", "chop"]
        dairy_keywords = ["dairy", "cream", "milk product"]
        grain_keywords = ["grain", "cereal", "wheat", "flour"]
        
        if any(kw in food_name for kw in fruit_keywords):
            return {"calories": 60, "protein": 0.5, "carbohydrates": 15, "fat": 0.2, "fiber": 2}
        elif any(kw in food_name for kw in vegetable_keywords):
            return {"calories": 30, "protein": 2, "carbohydrates": 5, "fat": 0.2, "fiber": 2.5}
        elif any(kw in food_name for kw in meat_keywords):
            return {"calories": 250, "protein": 26, "carbohydrates": 0, "fat": 15, "fiber": 0}
        elif any(kw in food_name for kw in dairy_keywords):
            return {"calories": 150, "protein": 8, "carbohydrates": 12, "fat": 8, "fiber": 0}
        elif any(kw in food_name for kw in grain_keywords):
            return {"calories": 150, "protein": 5, "carbohydrates": 30, "fat": 2, "fiber": 3}
        else:
            return {"calories": 200, "protein": 10, "carbohydrates": 20, "fat": 10, "fiber": 2}
    
    def calculate_meal_nutrition(self, food_items: list) -> Dict:
        """Calculate total nutrition for a meal"""
        total = {
            "calories": 0,
            "protein": 0,
            "carbohydrates": 0,
            "fat": 0,
            "fiber": 0
        }
        
        for item in food_items:
            nutrition = self.get_nutrition(item["name"], item.get("quantity", 100))
            for key in total:
                total[key] += nutrition[key]
        
        return {k: round(v, 2) for k, v in total.items()}
