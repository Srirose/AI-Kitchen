# 🚀 Quick Start Guide - NutriAI Pro

## What You Need to Install

### 1. **Node.js** (Required)
- **Download**: https://nodejs.org/
- **Version**: v16 or higher recommended
- **Why**: Runs the JavaScript code and provides npm for package management

### 2. **Git** (Optional but Recommended)
- **Download**: https://git-scm.com/
- **Why**: For version control and easy updates from GitHub

---

## Installation Steps

### Step 1: Clone or Download the Project

**Option A: Using Git (Recommended)**
```bash
git clone https://github.com/Srirose/AI-Kitchen.git
cd AI-Kitchen/nutriai-pro
```

**Option B: Manual Download**
1. Go to: https://github.com/Srirose/AI-Kitchen
2. Click "Code" → "Download ZIP"
3. Extract the ZIP file
4. Open terminal in the extracted `nutriai-pro` folder

### Step 2: Install Dependencies

Open terminal/command prompt in the project folder and run:

```bash
npm install
```

This will download and install:
- React framework
- Vite build tool
- All required libraries

**Time**: Usually takes 1-3 minutes depending on internet speed

### Step 3: Run the Application

```bash
npm run dev
```

You should see output like:
```
VITE v7.3.1  ready in 877 ms
➜  Local:   http://localhost:5173/
```

### Step 4: Open in Browser

1. Open your web browser (Chrome, Firefox, Edge recommended)
2. Go to: `http://localhost:5173`
3. You should see the NutriAI Pro login screen!

---

## Troubleshooting

### ❌ "npm is not recognized"
**Solution**: Install Node.js from https://nodejs.org/ and restart your computer

### ❌ "Port already in use"
**Solution**: The app will automatically use the next available port (5174, 5175, etc.)

### ❌ "Cannot find module 'react'"
**Solution**: Run `npm install` again to ensure all dependencies are installed

### ❌ Blank white screen
**Solution**: 
1. Wait a few seconds for the app to load
2. Check browser console (F12) for errors
3. Try clearing browser cache

---

## First Time Usage

1. **Sign Up**: Create an account (no email verification needed for local demo)
2. **Complete Profile**: Add your details to calculate BMI/BMR
3. **Select Meal**: Choose breakfast, lunch, dinner, or snacks
4. **Add Ingredients**: Use voice, image upload, or manual selection
5. **Get Analysis**: See nutritional breakdown and recipe suggestions
6. **Chat Mode**: Navigate to chat for personalized recommendations

---

## Commands Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install/update dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Check code quality |

---

## Features Overview

### ✅ Already Working:
- User authentication (local storage)
- Profile creation with health metrics
- BMI, BMR, TDEE calculations
- Meal planning with 7 meal slots
- Voice input for ingredients
- Image upload with YOLOv8 detection
- Recipe recommendations
- Chat mode navigation
- Dark theme UI
- Mobile-responsive design

### 🔧 Configuration (Optional):
Create a `.env` file in the project root for custom settings:
```env
VITE_API_URL=http://localhost:5000/api
VITE_ENABLE_IMAGE_UPLOAD=true
```

---

## Support

- **GitHub Issues**: https://github.com/Srirose/AI-Kitchen/issues
- **Repository**: https://github.com/Srirose/AI-Kitchen

---

**Enjoy your AI-powered nutrition assistant! 🌿**
