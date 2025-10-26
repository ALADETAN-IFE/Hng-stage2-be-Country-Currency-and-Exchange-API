const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  capital: {
    type: String,
    default: null
  },
  region: {
    type: String,
    default: null,
    index: true
  },
  population: {
    type: Number,
    required: true
  },
  currency_code: {
    type: String,
    default: null,
    index: true
  },
  exchange_rate: {
    type: Number,
    default: null
  },
  estimated_gdp: {
    type: Number,
    default: null
  },
  flag_url: {
    type: String,
    default: null
  },
  last_refreshed_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// name field already has index: true, so we don't need the duplicate index

module.exports = mongoose.model('Country', countrySchema);

