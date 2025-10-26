const mongoose = require('mongoose');

const refreshMetadataSchema = new mongoose.Schema({
  _id: {
    type: Number,
    default: 1
  },
  total_countries: {
    type: Number,
    default: 0
  },
  last_refreshed_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RefreshMetadata', refreshMetadataSchema);

