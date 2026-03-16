const mongoose = require('mongoose');

const sustainabilityDataSchema = new mongoose.Schema({
  ingredient: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['meat', 'dairy', 'eggs', 'fish', 'grains', 'vegetables', 'fruits', 'nuts', 'oils', 'beverages', 'processed']
  },
  carbonFootprint: {
    value: { type: Number, required: true },
    unit: { type: String, default: 'kg CO2e/kg' }
  },
  waterUsage: {
    value: { type: Number },
    unit: { type: String, default: 'L/kg' }
  },
  landUse: {
    value: { type: Number },
    unit: { type: String, default: 'm2/kg' }
  },
  eutrophication: {
    value: { type: Number },
    unit: { type: String, default: 'g PO4e/kg' }
  },
  normalizedScore: {
    type: Number,
    min: 0,
    max: 100
  },
  rating: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E', 'F']
  },
  source: {
    type: String,
    default: 'Poore & Nemecek 2018'
  },
  alternatives: [{
    ingredient: String,
    sustainabilityScore: Number
  }],
  tips: [{
    type: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

sustainabilityDataSchema.methods.calculateRating = function() {
  const score = this.normalizedScore;
  if (score >= 80) this.rating = 'A';
  else if (score >= 65) this.rating = 'B';
  else if (score >= 50) this.rating = 'C';
  else if (score >= 35) this.rating = 'D';
  else if (score >= 20) this.rating = 'E';
  else this.rating = 'F';
  return this.rating;
};

sustainabilityDataSchema.index({ category: 1, normalizedScore: -1 });

module.exports = mongoose.model('SustainabilityData', sustainabilityDataSchema);
