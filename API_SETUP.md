# API Integration Setup Guide

## Spoonacular + Edamam Integration for Ingredient Detection

This project now supports **dual API integration** for enhanced ingredient identification using both Spoonacular and Edamam APIs.

---

## 🚀 Getting Your API Keys

### 1. Spoonacular API (Free)

**Get your free API key:**
1. Visit: https://spoonacular.com/food-api
2. Click "Get API Key" or "Sign Up"
3. Choose the **Free plan** (50 requests/day)
4. Copy your API key

**What it does:**
- Food image classification
- Ingredient analysis
- Recipe parsing

### 2. Edamam API (Free)

**Get your free API credentials:**
1. Visit: https://developer.edamam.com/
2. Sign up for a free account
3. Create a new application
4. Copy both:
   - **Application ID** (`app_id`)
   - **API Key** (`app_key`)

**What it does:**
- Food database search
- Nutritional analysis
- Ingredient enrichment

---

## ⚙️ Configuration

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Edit the `.env` file with your API keys:
   ```env
   # Spoonacular API
   SPOONACULAR_API_KEY=your_actual_spoonacular_key_here
   
   # Edamam API
   EDAMAM_APP_ID=your_actual_app_id_here
   EDAMAM_API_KEY=your_actual_api_key_here
   
   # YOLO Service (optional)
   YOLO_SERVICE_URL=http://localhost:5001
   ```

3. Install dependencies (if needed):
   ```bash
   npm install
   ```

4. Restart the backend server:
   ```bash
   node server.js
   ```

---

## 🔍 How It Works

### Smart Detection Flow

When you upload a food image, the system uses this intelligent fallback chain:

```
1. Try YOLOv8 (if available) → Object detection
        ↓
2. Try Spoonacular → Food classification from image
        ↓
3. Try Edamam → Enrichment based on detected items
        ↓
4. Return combined results
```

### Features

✅ **Image Upload** - Detect ingredients from photos  
✅ **Text Search** - Search ingredients by name using Edamam  
✅ **Smart Fallback** - Multiple APIs ensure reliability  
✅ **Combined Results** - Merge detections from all sources  
✅ **Nutritional Data** - Get detailed nutrition info (Edamam)  

---

## 📝 API Endpoints

### Backend Routes

#### 1. Detect Ingredients from Image
```http
POST /api/ingredients/detect
Content-Type: multipart/form-data

Request:
- image: File (image/*)

Response:
{
  "ingredients": ["chicken", "rice", "broccoli"],
  "detailedIngredients": [
    {
      "name": "chicken breast",
      "confidence": 0.9,
      "source": "edamam"
    }
  ],
  "count": 3,
  "model": "YOLO + Edamam Food Database",
  "primarySource": "edamam"
}
```

#### 2. Search Ingredients by Text
```http
POST /api/ingredients/search
Content-Type: application/json

Request:
{
  "query": "chicken breast"
}

Response:
{
  "ingredients": [
    {
      "name": "Chicken Breast",
      "confidence": 0.9,
      "nutrients": {...},
      "category": "Poultry"
    }
  ],
  "count": 1,
  "hints": 15,
  "model": "Edamam Food Database"
}
```

---

## 🧪 Testing

### Test Image Detection

```javascript
// In frontend console or component
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const result = await ingredientsAPI.detectFromImage(file);
console.log('Detected ingredients:', result.ingredients);
```

### Test Text Search

```javascript
// Search for ingredients
const result = await ingredientsAPI.searchByText('tomato');
console.log('Search results:', result.ingredients);
```

---

## 🎯 Usage Examples

### Frontend Component Example

```jsx
import { ingredientsAPI } from './utils/api';

function IngredientUploader({ addToast }) {
  const handleImageUpload = async (file) => {
    try {
      const data = await ingredientsAPI.detectFromImage(file);
      addToast(`Found ${data.count} ingredients!`, 'success');
      console.log('Ingredients:', data.detailedIngredients);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <input 
      type="file" 
      accept="image/*"
      onChange={(e) => handleImageUpload(e.target.files[0])}
    />
  );
}
```

### Using Text Search

```jsx
function IngredientSearch({ addToast }) {
  const [query, setQuery] = useState('');

  const handleSearch = async () => {
    try {
      const result = await ingredientsAPI.searchByText(query);
      console.log('Found:', result.ingredients);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search ingredients..."
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}
```

---

## 🔑 API Limits

| API | Free Tier | Paid Plans |
|-----|-----------|------------|
| **Spoonacular** | 50 requests/day | Starting at $9/month |
| **Edamam** | 10,000 requests/month | Starting at $49/month |

💡 **Tip**: The smart fallback system minimizes API calls by using cached results when possible.

---

## 🐛 Troubleshooting

### "API key not configured" Error

**Solution**: Make sure your `.env` file has the correct keys and restart the backend:
```bash
# Check .env file
cat backend/.env

# Restart backend
node backend/server.js
```

### CORS Issues

**Solution**: The backend already has CORS enabled. If you still have issues, check `backend/server.js`:
```javascript
app.use(cors()); // Should be present
```

### Rate Limiting

If you hit API limits:
1. Wait for the quota to reset (daily/monthly)
2. Consider upgrading to a paid plan
3. Use YOLO service locally for unlimited basic detection

---

## 📚 Additional Resources

- **Spoonacular Docs**: https://spoonacular.com/food-api/docs
- **Edamam Docs**: https://www.edamam.com/developers/
- **Food Database**: https://world.openfoodfacts.org/

---

## ✅ Next Steps

1. ✅ Get your API keys from both services
2. ✅ Update `backend/.env` with your keys
3. ✅ Restart the backend server
4. ✅ Test image upload in the app
5. ✅ Try text-based ingredient search
6. ✅ Enjoy enhanced ingredient detection! 🎉

---

**Questions?** Check the README.md or open an issue on GitHub.
