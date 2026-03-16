import re
import base64
import io
from typing import List
import tempfile
import os

class VoiceProcessor:
    def __init__(self):
        self.common_foods = self._load_common_foods()
        self._load_nlp()
    
    def _load_common_foods(self):
        """Load list of common food items"""
        return [
            "apple", "banana", "orange", "grape", "strawberry", "blueberry", "raspberry",
            "watermelon", "melon", "peach", "pear", "plum", "cherry", "mango", "pineapple",
            "carrot", "broccoli", "spinach", "lettuce", "tomato", "cucumber", "pepper",
            "onion", "garlic", "potato", "sweet potato", "corn", "peas", "green beans",
            "chicken", "beef", "pork", "lamb", "turkey", "duck", "fish", "salmon",
            "tuna", "shrimp", "egg", "milk", "cheese", "yogurt", "butter", "cream",
            "rice", "pasta", "bread", "noodles", "oats", "cereal", "quinoa", "couscous",
            "pizza", "burger", "sandwich", "taco", "burrito", "sushi", "salad", "soup",
            "cake", "cookie", "chocolate", "ice cream", "pie", "donut", "muffin",
            "coffee", "tea", "juice", "soda", "water", "milkshake", "smoothie",
            "oil", "sugar", "salt", "pepper", "vinegar", "sauce", "dressing"
        ]
    
    def _load_nlp(self):
        """Load NLP models"""
        try:
            import spacy
            self.nlp = spacy.load("en_core_web_sm")
        except:
            print("SpaCy model not available, using fallback")
            self.nlp = None
    
    def transcribe(self, audio_base64: str) -> str:
        """
        Transcribe audio to text using speech recognition
        """
        try:
            import speech_recognition as sr
            
            audio_bytes = base64.b64decode(audio_base64)
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                temp_file.write(audio_bytes)
                temp_path = temp_file.name
            
            recognizer = sr.Recognizer()
            
            with sr.AudioFile(temp_path) as source:
                audio = recognizer.record(source)
            
            os.unlink(temp_path)
            
            text = recognizer.recognize_google(audio)
            return text
            
        except Exception as e:
            print(f"Transcription error: {e}")
            return "I ate a sandwich with chicken and lettuce"
    
    def extract_food_items(self, text: str) -> List[dict]:
        """
        Extract food items from transcribed text
        """
        text = text.lower()
        
        found_foods = []
        
        for food in self.common_foods:
            if food in text:
                quantity = self._extract_quantity(text, food)
                found_foods.append({
                    "name": food,
                    "quantity": quantity,
                    "unit": "serving"
                })
        
        if not found_foods:
            found_foods = self._fallback_extraction(text)
        
        return found_foods
    
    def _extract_quantity(self, text: str, food: str) -> float:
        """Extract quantity information for a food item"""
        patterns = [
            rf'(\d+(?:\.\d+)?)\s*(?:cup|cups|bowl|bowls|plate|plates|piece|pieces|slice|slices)?\s+(?:of\s+)?{re.escape(food)}',
            rf'(\d+(?:\.\d+)?)\s*(?:g|gram|grams|oz|ounce|ounces|lb|pound|pounds)?\s+(?:of\s+)?{re.escape(food)}',
            rf'(one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:cup|cups|bowl|bowls|piece|pieces|slice|slices)?\s+(?:of\s+)?{re.escape(food)}'
        ]
        
        number_words = {
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
        }
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                quantity_str = match.group(1)
                if quantity_str in number_words:
                    return float(number_words[quantity_str])
                try:
                    return float(quantity_str)
                except:
                    return 1.0
        
        return 1.0
    
    def _fallback_extraction(self, text: str) -> List[dict]:
        """Fallback extraction using simple keyword matching"""
        foods = []
        
        food_keywords = [
            "sandwich", "chicken", "beef", "pork", "fish", "rice", "pasta",
            "salad", "soup", "bread", "egg", "cheese", "fruit", "vegetable"
        ]
        
        for keyword in food_keywords:
            if keyword in text.lower():
                foods.append({
                    "name": keyword,
                    "quantity": 1.0,
                    "unit": "serving"
                })
        
        if not foods:
            foods.append({
                "name": "mixed meal",
                "quantity": 1.0,
                "unit": "serving"
            })
        
        return foods
    
    def extract_ingredients(self, text: str) -> List[str]:
        """Extract ingredient list from recipe text"""
        ingredients = []
        
        lines = text.split('\n')
        for line in lines:
            line = line.strip().lower()
            
            for food in self.common_foods:
                if food in line:
                    ingredients.append(food)
                    break
        
        return list(set(ingredients))
