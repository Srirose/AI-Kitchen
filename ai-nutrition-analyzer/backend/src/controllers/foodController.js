const axios = require('axios');
const FormData = require('form-data');
const { MealHistory } = require('../models');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const uploadFoodImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    const response = await axios.post(`${AI_SERVICE_URL}/api/food/recognize`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Food image upload error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error processing food image'
    });
  }
};

const analyzeVoiceInput = async (req, res) => {
  try {
    const { audioBase64 } = req.body;

    if (!audioBase64) {
      return res.status(400).json({
        success: false,
        message: 'No audio data provided'
      });
    }

    const response = await axios.post(`${AI_SERVICE_URL}/api/food/voice`, {
      audio: audioBase64
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Voice analysis error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error processing voice input'
    });
  }
};

const analyzeTextInput = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'No text provided'
      });
    }

    const response = await axios.post(`${AI_SERVICE_URL}/api/food/text`, {
      text
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Text analysis error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error processing text input'
    });
  }
};

const analyzeFood = async (req, res) => {
  try {
    const { foodItems, mealType } = req.body;
    const { userId } = req.user;

    const response = await axios.post(`${AI_SERVICE_URL}/api/food/analyze`, {
      foodItems
    });

    const analysisResult = response.data;

    const mealEntry = new MealHistory({
      userId,
      mealType: mealType || 'snack',
      inputMethod: 'text',
      foodItems: analysisResult.foodItems.map(item => ({
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || 'serving',
        confidence: item.confidence,
        nutrition: item.nutrition
      })),
      totalNutrition: analysisResult.totalNutrition,
      sustainability: analysisResult.sustainability
    });

    await mealEntry.save();

    res.json({
      success: true,
      data: {
        analysis: analysisResult,
        mealId: mealEntry._id
      }
    });
  } catch (error) {
    console.error('Food analysis error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error analyzing food'
    });
  }
};

const getNutritionInfo = async (req, res) => {
  try {
    const { foodName } = req.params;

    const response = await axios.get(`${AI_SERVICE_URL}/api/nutrition/${encodeURIComponent(foodName)}`);

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Get nutrition info error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error retrieving nutrition information'
    });
  }
};

module.exports = {
  uploadFoodImage,
  analyzeVoiceInput,
  analyzeTextInput,
  analyzeFood,
  getNutritionInfo
};
