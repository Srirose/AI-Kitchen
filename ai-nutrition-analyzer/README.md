# AI-Powered Sustainable Nutrition Analyzer

A full-stack web application that helps users track food intake, analyze nutrition, calculate health metrics, and receive sustainable food recommendations using AI/ML technologies.

## Features

- **Multimodal Food Input**: Upload images, record voice, or type to log meals
- **AI Food Recognition**: YOLOv8-powered computer vision for food detection
- **Nutrition Analysis**: Comprehensive macronutrient and calorie tracking
- **Sustainability Scoring**: Carbon footprint calculation and eco-friendly ratings
- **Personalized Recommendations**: AI-powered meal suggestions based on health goals
- **Health Metrics**: BMI, BMR, and daily calorie target calculations
- **Interactive Dashboard**: Visual charts and progress tracking with Recharts
- **Meal History**: Calendar view and detailed meal logs

## Tech Stack

### Frontend
- React.js 18
- Tailwind CSS
- Recharts (data visualization)
- Axios (API calls)
- Firebase Authentication

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Firebase Admin SDK

### AI/ML Services
- Python
- FastAPI
- YOLOv8 (food recognition)
- OpenCV (image preprocessing)
- spaCy/NLTK (NLP for voice/text)

## Project Structure

```
ai-nutrition-analyzer/
├── frontend/           # React.js application
├── backend/            # Node.js/Express API
├── ai-services/        # Python FastAPI AI services
├── docker-compose.yml  # Docker orchestration
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- MongoDB
- Docker (optional)

### Local Development

1. **Clone the repository**
```bash
cd ai-nutrition-analyzer
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

3. **Setup AI Services**
```bash
cd ai-services
pip install -r requirements.txt
python main.py
```

4. **Setup Frontend**
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Docker Deployment

```bash
docker-compose up -d
```

Access the application at:
- Frontend: http://localhost
- Backend API: http://localhost:5000
- AI Services: http://localhost:8000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### User Profile
- `POST /api/user/profile` - Create profile
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/health-metrics` - Get BMI/BMR

### Food Analysis
- `POST /api/food/upload` - Upload food image
- `POST /api/food/voice` - Process voice input
- `POST /api/food/text` - Process text input
- `POST /api/food/analyze` - Analyze food nutrition

### Nutrition Reports
- `GET /api/nutrition/report/daily` - Daily nutrition report
- `GET /api/nutrition/report/weekly` - Weekly nutrition report

### Recommendations
- `GET /api/recommendations` - Get AI meal recommendations
- `GET /api/recommendations/sustainability-tips` - Get eco tips

### History
- `GET /api/history` - Get meal history
- `GET /api/history/calendar` - Get calendar view
- `DELETE /api/history/:id` - Delete meal entry

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT
