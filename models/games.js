const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    short_description: String,
    required_age: Number,
    about_the_game: String,
    price: {
      type: Number,
      default: 0,
    },
    release_date: Date,
    genres: {
      type: [String],
      default: [],
    },
    supported_languages: {
      type: [String],
      default: [],
    },
    categories: {
      type: [String],
      default: [],
    },
    windows: Boolean,
    mac: Boolean,
    linux: Boolean,
    notes: String,
    developers: {
      type: [String],
      default: [],
    },
    publishers: {
      type: [String],
      default: [],
    },
    screenshots: {
      type: [String],
      default: [],
    },
    header_image: String,
    website: String,
    metacritic_score: Number,
    metacritic_url: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

GameSchema.virtual("rating").get(function () {
  return 4.5;
});

module.exports = mongoose.model("Game", GameSchema);
