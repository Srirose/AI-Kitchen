# 🌿 NutriAI Pro - AI-Powered Nutrition Assistant

A mobile-first, dark-themed React application that provides intelligent nutrition analysis, meal planning, and recipe recommendations using computer vision and rule-based AI.

![NutriAI Pro](https://img.shields.io/badge/version-1.0.0-green.svg)
![React](https://img.shields.io/badge/React-19.2.0-blue.svg)
![Vite](https://img.shields.io/badge/Vite-7.3.1-purple.svg)

## ✨ Features

### Core Functionality
- **📸 Image-Based Food Recognition** - Upload food photos for instant ingredient detection using YOLOv8
- **🎤 Voice Input** - Hands-free ingredient entry with voice-to-text transcription
- **🍽️ Meal Planning** - Organize meals across 7 different time slots (Breakfast, Lunch, Dinner, Snacks, Dessert, Brunch, Supper)
- **🔬 Nutrition Analysis** - Get detailed nutritional breakdown including calories, macros, vitamins, and minerals
- **💬 Chat Mode** - Interactive AI-powered nutrition chatbot for personalized recommendations
- **📊 Health Metrics** - Real-time BMI, BMR, and TDEE calculations based on your profile
- **♻️ Sustainability Scoring** - Evaluate the environmental impact of your meal choices

### User Experience
- **Mobile-First Design** - Optimized for smartphones with responsive UI
- **Dark Theme** - Easy on the eyes with modern dark mode interface
- **Profile Management** - Personalized nutrition based on age, weight, activity level, dietary preferences
- **Dietary Support** - Vegetarian, Vegan, Keto, Paleo, Mediterranean, and more
- **Health Conditions** - Accommodates diabetes, PCOS, thyroid issues, allergies, and more

## 🚀 Installation

### Prerequisites
Before you begin, ensure you have the following installed:

#### Required Software
1. **Node.js** (v16 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Git** (for version control)
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/Srirose/AI-Kitchen.git
cd AI-Kitchen/nutriai-pro
```

#### 2. Install Dependencies
```bash
npm install
```

This will install:
- React 19.2.0
- React DOM 19.2.0
- Vite 7.3.1
- All required dev dependencies

#### 3. Environment Setup (Optional)
If you plan to integrate external APIs, create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_ENABLE_IMAGE_UPLOAD=true
VITE_MAX_INGREDIENTS=50
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
- Opens at `http://localhost:5173` (or next available port)
- Hot reload enabled for instant updates

### Build for Production
```bash
npm run build
```
- Creates optimized production bundle in `dist/` folder

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## 📁 Project Structure

```
nutriai-pro/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── Bar.jsx      # Bar chart component
│   │   ├── Btn.jsx      # Button component
│   │   ├── Bubble.jsx   # Chat bubble component
│   │   ├── Chip.jsx     # Selection chip component
│   │   ├── Fld.jsx      # Input field component
│   │   ├── ImgBtn.jsx   # Image upload button
│   │   ├── Ring.jsx     # Circular progress component
│   │   ├── Toast.jsx    # Notification component
│   │   └── VoiceBtn.jsx # Voice input button
│   ├── screens/         # Application screens
│   │   ├── AnalysisScreen.jsx  # Nutrition analysis & recipes
│   │   ├── AuthScreen.jsx      # Login/signup
│   │   ├── LoginScreen.jsx     # Login form
│   │   ├── MealPlanner.jsx     # Meal planning interface
│   │   └── ProfileScreen.jsx   # User profile setup
│   ├── utils/           # Utility functions
│   │   ├── api.js       # API integration
│   │   ├── constants.js # App constants
│   │   ├── db.js        # Local storage helpers
│   │   └── math.js      # BMI/BMR/TDEE calculations
│   ├── hooks/           # Custom React hooks
│   │   └── useToast.js  # Toast notification hook
│   ├── App.jsx          # Main application component
│   ├── index.css        # Global styles
│   └── main.jsx         # Entry point
├── index.html           # HTML template
├── package.json         # Dependencies & scripts
├── vite.config.js       # Vite configuration
└── README.md            # This file
```

## 🎯 Usage Guide

### Getting Started

1. **Sign Up / Login**
   - Create an account or sign in
   - Authentication is handled locally for demo purposes

2. **Complete Your Profile**
   - Enter personal details (name, phone, email)
   - Add body metrics (age, height, weight, biological sex)
   - Set fitness goals and activity level
   - Choose diet preferences
   - List any health conditions or allergies
   - View real-time BMI and BMR calculations

3. **Plan Your Meal**
   - Select a meal slot (Breakfast, Lunch, Dinner, etc.)
   - Choose number of servings
   - Add ingredients via:
     - Manual text input
     - Voice command (click mic button)
     - Image upload (camera button)
     - Quick-select chips from ingredient list

4. **Analyze & Get Recipes**
   - Click "Analyze & Get Recipes" to see nutritional breakdown
   - View detailed macro/micronutrient information
   - Get AI-generated recipe suggestions
   - Access sustainability score

5. **Chat Mode**
   - Navigate to chat from Profile or Meal Planner
   - Ask nutrition-related questions
   - Get personalized meal recommendations
   - Discuss dietary restrictions and alternatives

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **Custom CSS** - Styling with dark theme
- **Recharts** - Data visualization (if needed)

### Backend Integration (Ready for Implementation)
- **Node.js + Express** - API server
- **YOLOv8** - Computer vision for food recognition
- **Rule-based AI** - Recipe recommendation engine
- **SQLite/PostgreSQL** - Database (optional)

### Key Features Implementation
- **Image Processing**: Client-side compression before upload
- **Voice Recognition**: Web Speech API integration
- **Local Storage**: User data persistence
- **Responsive Design**: Mobile-first approach

## 🔧 Configuration

### Vite Configuration (`vite.config.js`)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
})
```

### Customization Options

#### Change Theme Colors
Edit `src/index.css` to modify the color scheme:
```css
:root {
  --primary-color: #4ade80;
  --secondary-color: #0ea5e9;
  --background: #070d17;
  /* ... */
}
```

#### Add New Ingredients
Modify the `INGS` array in `src/screens/MealPlanner.jsx`:
```javascript
const INGS = [
  'Rice', 'Wheat', 'Oats', // ... add more
];
```

#### Extend Meal Slots
Add new meal types in `src/screens/MealPlanner.jsx`:
```javascript
const MEAL_SLOTS = [
  { id: 'snack', name: 'Snack', icon: '🍎', color: '#0ea5e9' },
  // Add more slots here
];
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
Error: Port 5173 is in use
```
**Solution**: Vite automatically finds the next available port. Look for the actual port in terminal output.

#### Module Not Found
```bash
Error: Cannot find module 'react'
```
**Solution**: Run `npm install` again to ensure all dependencies are installed.

#### Blank Screen After Build
**Solution**: 
1. Clear browser cache
2. Check console for errors
3. Verify all imports are correct
4. Run `npm run build` again

#### Git Issues
```bash
fatal: not a git repository
```
**Solution**: Initialize git in the project directory:
```bash
git init
git add .
git commit -m "Initial commit"
```

## 📝 Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

## 🔐 Privacy & Security

- All user data is stored locally in browser
- No external API calls by default
- Image processing happens client-side
- No authentication tokens sent to external servers

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with React and Vite
- Uses YOLOv8 for computer vision
- Inspired by nutrition tracking best practices
- Designed for mobile-first experience

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Contact: [Your Email]
- Repository: https://github.com/Srirose/AI-Kitchen

---

**Made with ❤️ for better nutrition and healthier lifestyles**
