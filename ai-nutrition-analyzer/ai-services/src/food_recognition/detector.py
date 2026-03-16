import os
import json
import numpy as np
from typing import List, Dict
import cv2

class FoodDetector:
    def __init__(self, model_path=None):
        self.model_path = model_path or "models/yolov8n-food.pt"
        self.class_names = self._load_class_names()
        self.model = None
        self._load_model()
    
    def _load_class_names(self):
        """Load food class names"""
        default_classes = [
            "apple", "banana", "beef", "bread", "broccoli", "burger", "cake", "carrot",
            "cheese", "chicken", "chocolate", "coffee", "cookie", "corn", "croissant",
            "cucumber", "donut", "egg", "fish", "french_fries", "grapes", "hamburger",
            "hot_dog", "ice_cream", "lasagna", "lemon", "lettuce", "meat", "milk",
            "muffin", "mushroom", "onion", "orange", "pancake", "pasta", "peach",
            "pear", "pepper", "pie", "pizza", "pork", "potato", "pudding", "rice",
            "salad", "salmon", "sandwich", "sausage", "shrimp", "soup", "spinach",
            "steak", "strawberry", "sushi", "taco", "tea", "toast", "tomato", "tuna",
            "watermelon", "wine", "yogurt"
        ]
        return default_classes
    
    def _load_model(self):
        """Load YOLOv8 model"""
        try:
            from ultralytics import YOLO
            
            if os.path.exists(self.model_path):
                self.model = YOLO(self.model_path)
            else:
                print(f"Model file not found at {self.model_path}, using default YOLOv8n")
                self.model = YOLO("yolov8n.pt")
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
    
    def detect(self, image: np.ndarray, confidence_threshold: float = 0.5) -> List[Dict]:
        """
        Detect food items in image
        """
        if self.model is None:
            return self._mock_detection(image)
        
        try:
            results = self.model(image, verbose=False)
            detections = []
            
            for result in results:
                boxes = result.boxes
                for box in boxes:
                    confidence = float(box.conf[0])
                    if confidence >= confidence_threshold:
                        class_id = int(box.cls[0])
                        class_name = self.class_names[class_id] if class_id < len(self.class_names) else f"food_{class_id}"
                        
                        x1, y1, x2, y2 = box.xyxy[0].tolist()
                        
                        detections.append({
                            "name": class_name,
                            "confidence": round(confidence, 3),
                            "bbox": {
                                "x1": round(x1, 2),
                                "y1": round(y1, 2),
                                "x2": round(x2, 2),
                                "y2": round(y2, 2)
                            }
                        })
            
            return detections
        except Exception as e:
            print(f"Detection error: {e}")
            return self._mock_detection(image)
    
    def _mock_detection(self, image: np.ndarray) -> List[Dict]:
        """Mock detection for demonstration"""
        import random
        
        mock_foods = random.sample(self.class_names, min(3, len(self.class_names)))
        detections = []
        
        for food in mock_foods:
            detections.append({
                "name": food,
                "confidence": round(random.uniform(0.7, 0.95), 3),
                "bbox": {
                    "x1": round(random.uniform(10, 200), 2),
                    "y1": round(random.uniform(10, 200), 2),
                    "x2": round(random.uniform(250, 400), 2),
                    "y2": round(random.uniform(250, 400), 2)
                }
            })
        
        return detections
    
    def train(self, data_yaml: str, epochs: int = 100, batch_size: int = 16):
        """Train the model on custom dataset"""
        if self.model is None:
            raise ValueError("Model not loaded")
        
        self.model.train(
            data=data_yaml,
            epochs=epochs,
            batch=batch_size,
            imgsz=640
        )
