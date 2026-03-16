import json
import os
from typing import Dict, List

class SustainabilityScorer:
    def __init__(self):
        self.carbon_data = self._load_carbon_data()
        self.tips = self._load_tips()
    
    def _load_carbon_data(self):
        """Load carbon footprint data (kg CO2e per kg of food)"""
        return {
            "beef": 60.0,
            "lamb": 24.0,
            "cheese": 21.0,
            "pork": 7.0,
            "turkey": 6.0,
            "chicken": 6.0,
            "tuna": 6.0,
            "eggs": 4.5,
            "potato": 2.9,
            "rice": 4.0,
            "nuts": 2.3,
            "beans": 2.0,
            "tofu": 2.0,
            "vegetables": 2.0,
            "milk": 3.2,
            "fruit": 1.1,
            "lentils": 0.9,
            "peas": 0.9,
            "tomato": 1.1,
            "broccoli": 2.0,
            "nuts": 2.3,
            "peanut butter": 2.5,
            "bread": 1.6,
            "pasta": 1.5,
            "pizza": 3.5,
            "burger": 8.0,
            "sandwich": 3.0,
            "salad": 2.0,
            "soup": 2.5,
            "chocolate": 19.0,
            "coffee": 17.0,
            "wine": 1.6,
            "beer": 1.0,
            "soda": 0.5,
            "juice": 1.5,
            "apple": 0.4,
            "banana": 0.8,
            "orange": 0.5,
            "grape": 1.0,
            "strawberry": 0.4,
            "carrot": 0.3,
            "spinach": 0.4,
            "lettuce": 0.5,
            "cucumber": 0.3,
            "onion": 0.3,
            "corn": 1.0,
            "peas": 0.9,
            "salmon": 5.0,
            "shrimp": 12.0,
            "fish": 5.0,
            "tuna": 6.0,
            "yogurt": 2.2,
            "butter": 12.0,
            "oil": 6.0,
            "sugar": 3.0,
            "mixed meal": 5.0
        }
    
    def _load_tips(self):
        """Load sustainability tips"""
        return [
            "Choose plant-based proteins like beans and lentils more often",
            "Reduce beef and lamb consumption - they have the highest carbon footprint",
            "Buy local and seasonal produce to reduce transportation emissions",
            "Minimize food waste by planning meals and using leftovers",
            "Choose sustainably sourced seafood",
            "Reduce dairy consumption or try plant-based alternatives",
            "Buy in bulk to reduce packaging waste",
            "Compost food scraps instead of throwing them away",
            "Choose organic when possible to reduce pesticide use",
            "Drink tap water instead of bottled beverages"
        ]
    
    def get_carbon_footprint(self, food_name: str, quantity_grams: float = 100) -> float:
        """
        Get carbon footprint for a food item
        """
        food_name = food_name.lower().strip()
        
        carbon_per_kg = self.carbon_data.get(food_name, 3.0)
        
        quantity_kg = quantity_grams / 1000
        
        return round(carbon_per_kg * quantity_kg, 3)
    
    def calculate_score(self, total_carbon: float) -> Dict:
        """
        Calculate sustainability score based on carbon footprint
        Score = 1 - (CarbonFootprint - Min) / (Max - Min)
        """
        min_carbon = 0.1
        max_carbon = 20.0
        
        normalized = (total_carbon - min_carbon) / (max_carbon - min_carbon)
        normalized = max(0, min(1, normalized))
        
        score = (1 - normalized) * 100
        
        if score >= 80:
            rating = "A"
        elif score >= 65:
            rating = "B"
        elif score >= 50:
            rating = "C"
        elif score >= 35:
            rating = "D"
        elif score >= 20:
            rating = "E"
        else:
            rating = "F"
        
        return {
            "carbonFootprint": round(total_carbon, 3),
            "sustainabilityScore": round(score, 1),
            "rating": rating,
            "unit": "kg CO2e"
        }
    
    def get_tips(self, count: int = 5) -> List[str]:
        """Get random sustainability tips"""
        import random
        return random.sample(self.tips, min(count, len(self.tips)))
    
    def get_alternatives(self, food_name: str) -> List[Dict]:
        """Get sustainable alternatives for a food item"""
        food_name = food_name.lower().strip()
        
        alternatives_map = {
            "beef": [
                {"name": "chicken", "carbonReduction": 90},
                {"name": "beans", "carbonReduction": 97},
                {"name": "lentils", "carbonReduction": 98}
            ],
            "lamb": [
                {"name": "chicken", "carbonReduction": 75},
                {"name": "tofu", "carbonReduction": 92}
            ],
            "cheese": [
                {"name": "tofu", "carbonReduction": 90},
                {"name": "nuts", "carbonReduction": 89}
            ],
            "pork": [
                {"name": "chicken", "carbonReduction": 14},
                {"name": "beans", "carbonReduction": 71}
            ],
            "shrimp": [
                {"name": "fish", "carbonReduction": 58},
                {"name": "tofu", "carbonReduction": 83}
            ],
            "chocolate": [
                {"name": "fruit", "carbonReduction": 94},
                {"name": "nuts", "carbonReduction": 88}
            ],
            "coffee": [
                {"name": "tea", "carbonReduction": 94},
                {"name": "water", "carbonReduction": 100}
            ]
        }
        
        return alternatives_map.get(food_name, [
            {"name": "vegetables", "carbonReduction": 70},
            {"name": "legumes", "carbonReduction": 80}
        ])
    
    def calculate_meal_sustainability(self, food_items: list) -> Dict:
        """Calculate sustainability for a meal"""
        total_carbon = 0
        
        for item in food_items:
            carbon = self.get_carbon_footprint(item["name"], item.get("quantity", 100))
            total_carbon += carbon
        
        return self.calculate_score(total_carbon)
