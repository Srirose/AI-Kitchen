import cv2
import numpy as np
from PIL import Image
import io

class ImageProcessor:
    def __init__(self, target_size=(640, 640)):
        self.target_size = target_size
    
    def preprocess(self, image_bytes):
        """
        Preprocess image for food recognition model
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("Could not decode image")
        
        image = self._resize_image(image)
        image = self._normalize_image(image)
        image = self._enhance_contrast(image)
        
        return image
    
    def _resize_image(self, image):
        """Resize image while maintaining aspect ratio"""
        h, w = image.shape[:2]
        target_h, target_w = self.target_size
        
        scale = min(target_w / w, target_h / h)
        new_w = int(w * scale)
        new_h = int(h * scale)
        
        resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_LINEAR)
        
        result = np.full((target_h, target_w, 3), 128, dtype=np.uint8)
        y_offset = (target_h - new_h) // 2
        x_offset = (target_w - new_w) // 2
        result[y_offset:y_offset + new_h, x_offset:x_offset + new_w] = resized
        
        return result
    
    def _normalize_image(self, image):
        """Normalize pixel values"""
        return image.astype(np.float32) / 255.0
    
    def _enhance_contrast(self, image):
        """Apply contrast enhancement"""
        lab = cv2.cvtColor((image * 255).astype(np.uint8), cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        
        enhanced = cv2.merge([l, a, b])
        enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
        
        return enhanced.astype(np.float32) / 255.0
    
    def reduce_noise(self, image):
        """Apply noise reduction"""
        return cv2.fastNlMeansDenoisingColored(
            (image * 255).astype(np.uint8),
            None,
            10, 10, 7, 21
        ).astype(np.float32) / 255.0
    
    def detect_edges(self, image):
        """Detect edges in image"""
        gray = cv2.cvtColor((image * 255).astype(np.uint8), cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 100, 200)
        return edges
