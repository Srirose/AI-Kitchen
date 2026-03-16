from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os

from src.food_recognition.detector import FoodDetector
from src.preprocessing.image_processor import ImageProcessor
from src.preprocessing.voice_processor import VoiceProcessor
from src.nutrition_analysis.calculator import NutritionCalculator
from src.sustainability.scorer import SustainabilityScorer
from src.recommendation.engine import RecommendationEngine

app = FastAPI(
    title="AI Nutrition Analyzer API",
    description="AI-powered food recognition, nutrition analysis, and sustainability scoring",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

food_detector = FoodDetector()
image_processor = ImageProcessor()
voice_processor = VoiceProcessor()
nutrition_calculator = NutritionCalculator()
sustainability_scorer = SustainabilityScorer()
recommendation_engine = RecommendationEngine()

class FoodItem(BaseModel):
    name: str
    quantity: float = 1.0
    unit: str = "serving"

class FoodAnalysisRequest(BaseModel):
    foodItems: List[FoodItem]

class VoiceInputRequest(BaseModel):
    audio: str

class TextInputRequest(BaseModel):
    text: str

class UserProfile(BaseModel):
    bmi: float
    bmr: float
    dailyCalorieTarget: int
    fitnessGoal: str
    foodAllergies: List[str] = []
    healthConditions: List[str] = []

class RecommendationRequest(BaseModel):
    userProfile: UserProfile
    mealType: Optional[str] = None
    count: int = 5

@app.get("/")
async def root():
    return {"message": "AI Nutrition Analyzer API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-nutrition-analyzer"}

@app.post("/api/food/recognize")
async def recognize_food(image: UploadFile = File(...)):
    try:
        contents = await image.read()
        
        processed_image = image_processor.preprocess(contents)
        
        detections = food_detector.detect(processed_image)
        
        return {
            "success": True,
            "data": {
                "detectedFoods": detections,
                "count": len(detections)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/food/voice")
async def process_voice_input(request: VoiceInputRequest):
    try:
        text = voice_processor.transcribe(request.audio)
        
        food_items = voice_processor.extract_food_items(text)
        
        return {
            "success": True,
            "data": {
                "transcription": text,
                "extractedFoods": food_items
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/food/text")
async def process_text_input(request: TextInputRequest):
    try:
        food_items = voice_processor.extract_food_items(request.text)
        
        return {
            "success": True,
            "data": {
                "extractedFoods": food_items
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/food/analyze")
async def analyze_food(request: FoodAnalysisRequest):
    try:
        food_items_with_nutrition = []
        total_nutrition = {
            "calories": 0,
            "protein": 0,
            "carbohydrates": 0,
            "fat": 0,
            "fiber": 0
        }
        
        total_carbon = 0
        
        for item in request.foodItems:
            nutrition = nutrition_calculator.get_nutrition(item.name, item.quantity)
            carbon = sustainability_scorer.get_carbon_footprint(item.name, item.quantity)
            
            food_items_with_nutrition.append({
                "name": item.name,
                "quantity": item.quantity,
                "unit": item.unit,
                "nutrition": nutrition,
                "carbonFootprint": carbon
            })
            
            for key in total_nutrition:
                total_nutrition[key] += nutrition.get(key, 0)
            
            total_carbon += carbon
        
        sustainability = sustainability_scorer.calculate_score(total_carbon)
        
        return {
            "success": True,
            "data": {
                "foodItems": food_items_with_nutrition,
                "totalNutrition": total_nutrition,
                "sustainability": sustainability
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/nutrition/{food_name}")
async def get_nutrition_info(food_name: str):
    try:
        nutrition = nutrition_calculator.get_nutrition(food_name, 100)
        
        return {
            "success": True,
            "data": {
                "food": food_name,
                "nutritionPer100g": nutrition
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommendations")
async def get_recommendations(request: RecommendationRequest):
    try:
        recommendations = recommendation_engine.generate(
            request.userProfile.dict(),
            request.mealType,
            request.count
        )
        
        return {
            "success": True,
            "data": {
                "recommendations": recommendations,
                "count": len(recommendations)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sustainability/tips")
async def get_sustainability_tips():
    try:
        tips = sustainability_scorer.get_tips()
        
        return {
            "success": True,
            "data": {
                "tips": tips
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
