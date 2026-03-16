const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

const schemas = {
  signup: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(100).required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  profile: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    age: Joi.number().integer().min(1).max(150).required(),
    height: Joi.number().min(50).max(300).required(),
    weight: Joi.number().min(20).max(500).required(),
    gender: Joi.string().valid('male', 'female', 'other').required(),
    activityLevel: Joi.string().valid('sedentary', 'light', 'moderate', 'active', 'very_active').required(),
    fitnessGoal: Joi.string().valid('lose_weight', 'maintain', 'gain_muscle', 'improve_health').required(),
    foodAllergies: Joi.array().items(Joi.string()),
    healthConditions: Joi.array().items(Joi.string())
  }),
  
  mealEntry: Joi.object({
    mealType: Joi.string().valid('breakfast', 'lunch', 'dinner', 'snack').required(),
    foodItems: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        quantity: Joi.number().positive().default(1),
        unit: Joi.string().default('serving')
      })
    ).required(),
    notes: Joi.string().allow('')
  })
};

module.exports = {
  validate,
  schemas
};
