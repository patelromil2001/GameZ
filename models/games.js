const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    default: 0
  },
  release_date: {
    type: Date
  },
  genres: {
    type: [String],
    default: []
  },
  developer: {
    type: String
  },
  publisher: {
    type: String
  },
  image: {
    type: String 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

GameSchema.virtual('rating').get(function () {
  return 4.5;
});

module.exports = mongoose.model('Game', GameSchema);
