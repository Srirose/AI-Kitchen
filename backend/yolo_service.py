"""
YOLOv8 Food/Ingredient Detection Service
Runs as a separate Python Flask service for image ingredient detection
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import io
import base64
import os

app = Flask(__name__)
CORS(app)

# Load YOLOv8 model (using nano for speed, can upgrade to 'yolov8m.pt' or 'yolov8l.pt')
print("Loading YOLOv8 model...")
model = YOLO('yolov8n.pt')
print("Model loaded successfully!")

# Food-related COCO classes that YOLOv8 can detect
FOOD_CLASSES = {
    39: 'bottle', 40: 'wine glass', 41: 'cup', 42: 'fork', 43: 'knife',
    44: 'spoon', 45: 'bowl', 46: 'banana', 47: 'apple', 48: 'sandwich',
    49: 'orange', 50: 'broccoli', 51: 'carrot', 52: 'hot dog', 53: 'pizza',
    54: 'donut', 55: 'cake'
}

# Map detected objects to common ingredients
INGREDIENT_MAPPING = {
    'banana': 'Banana',
    'apple': 'Apple',
    'orange': 'Orange',
    'broccoli': 'Broccoli',
    'carrot': 'Carrot',
    'sandwich': 'Bread',
    'pizza': 'Pizza',
    'hot dog': 'Sausage',
    'donut': 'Dough',
    'cake': 'Cake',
    'bowl': 'Bowl',
    'cup': 'Cup',
    'bottle': 'Bottle',
    'wine glass': 'Wine',
    'fork': 'Fork',
    'knife': 'Knife',
    'spoon': 'Spoon'
}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model': 'YOLOv8n'})

@app.route('/detect', methods=['POST'])
def detect_ingredients():
    """
    Detect ingredients from an image using YOLOv8
    Expects: { "image": "base64_encoded_image_string" }
    Returns: { "ingredients": ["Ingredient1", "Ingredient2", ...] }
    """
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400

        # Decode base64 image
        image_data = base64.b64decode(data['image'])
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to numpy array for OpenCV
        img_array = np.array(image)
        if len(img_array.shape) == 3 and img_array.shape[2] == 4:
            # Convert RGBA to RGB
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGBA2RGB)
        elif len(img_array.shape) == 3 and img_array.shape[2] == 3:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

        # Run YOLOv8 inference
        results = model(img_array, verbose=False)

        # Extract detected classes
        detected_ingredients = set()
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    
                    # Only include food-related classes with confidence > 0.5
                    if cls_id in FOOD_CLASSES and conf > 0.5:
                        class_name = FOOD_CLASSES[cls_id]
                        ingredient = INGREDIENT_MAPPING.get(class_name, class_name.title())
                        detected_ingredients.add(ingredient)

        # If no food items detected, try to provide helpful fallback
        ingredients_list = list(detected_ingredients)
        
        if not ingredients_list:
            # Check if image contains any objects at all
            all_detections = []
            for result in results:
                if result.boxes is not None:
                    for box in result.boxes:
                        conf = float(box.conf[0])
                        if conf > 0.5:
                            cls_id = int(box.cls[0])
                            all_detections.append(model.names[cls_id])
            
            if all_detections:
                return jsonify({
                    'ingredients': [],
                    'message': 'No food items detected. Try a clearer photo of food.',
                    'detected_objects': all_detections[:5]  # Show what was detected
                })
            else:
                return jsonify({
                    'ingredients': [],
                    'message': 'No ingredients found. Try a clearer, closer photo of the food.'
                })

        return jsonify({
            'ingredients': ingredients_list,
            'count': len(ingredients_list),
            'model': 'YOLOv8n'
        })

    except Exception as e:
        print(f"Detection error: {str(e)}")
        return jsonify({'error': f'Detection failed: {str(e)}'}), 500

@app.route('/detect-file', methods=['POST'])
def detect_from_file():
    """
    Alternative endpoint that accepts multipart/form-data file upload
    """
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        # Read image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to numpy array
        img_array = np.array(image)
        if len(img_array.shape) == 3 and img_array.shape[2] == 4:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGBA2RGB)
        elif len(img_array.shape) == 3 and img_array.shape[2] == 3:
            img_array = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

        # Run YOLOv8 inference
        results = model(img_array, verbose=False)

        # Extract detected classes
        detected_ingredients = set()
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    
                    if cls_id in FOOD_CLASSES and conf > 0.5:
                        class_name = FOOD_CLASSES[cls_id]
                        ingredient = INGREDIENT_MAPPING.get(class_name, class_name.title())
                        detected_ingredients.add(ingredient)

        ingredients_list = list(detected_ingredients)
        
        if not ingredients_list:
            return jsonify({
                'ingredients': [],
                'message': 'No food items detected. Try a clearer photo of food.'
            })

        return jsonify({
            'ingredients': ingredients_list,
            'count': len(ingredients_list),
            'model': 'YOLOv8n'
        })

    except Exception as e:
        print(f"Detection error: {str(e)}")
        return jsonify({'error': f'Detection failed: {str(e)}'}), 500

if __name__ == '__main__':
    print("Starting YOLOv8 Food Detection Service...")
    print("This service runs on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=False)
