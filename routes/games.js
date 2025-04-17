const express = require("express");
const router = express.Router();
const Game = require("../models/games");
const {authenticateUser} = require("../middleware/auth");

// api fetching all the games
router.get("/all-games", authenticateUser, async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Sorting
    let sort = {};
    if (req.query.sort) {
      const sortField = req.query.sort.startsWith("-")
        ? req.query.sort.substring(1)
        : req.query.sort;

      const sortOrder = req.query.sort.startsWith("-") ? -1 : 1;

      // Only allow sorting on fields that exist in our schema
      const allowedSortFields = [
        "name",
        "price",
        "release_date",
        "positive",
        "negative",
      ];

      if (allowedSortFields.includes(sortField)) {
        sort[sortField] = sortOrder;
      }
    } else {
      // Default sort by release date in ascending
      sort = { release_date: 1 };
    }

    let filter = {};

    // Filter by genres - using regex cuz data is 'string' inside [array] inside "string"
    if (req.query.genres) {
      const genresList = req.query.genres
        .split(",")
        .map((genre) => genre.trim());

      // Create an array of regex patterns for each genre
      const genrePatterns = genresList.map(
        (genre) => new RegExp(`'${genre}'`, "i") // Match the genre with single quotes around it
      );

      // $or to match any of the genres
      filter.$or = genrePatterns.map((pattern) => ({ genres: pattern }));
    }

    // Filter by categories - using regex cuz data is 'string' inside [array] inside "string"
    if (req.query.categories) {
      const categoriesList = req.query.categories
        .split(",")
        .map((category) => category.trim());

      // Create an array of regex patterns for each category
      const categoryPatterns = categoriesList.map(
        (category) => new RegExp(`'${category}'`, "i")
      );

      // If we already have an $or from genres, we need to handle this differently
      if (filter.$or) {
        // Save the existing $or conditions
        const existingOr = filter.$or;

        // Create new $or conditions for categories
        const categoryOr = categoryPatterns.map((pattern) => ({
          categories: pattern,
        }));

        // Use $and to combine the two $or conditions
        filter.$and = [{ $or: existingOr }, { $or: categoryOr }];

        // Remove the original $or since it's now in $and
        delete filter.$or;
      } else {
        // If there's no existing $or, just create one for categories
        filter.$or = categoryPatterns.map((pattern) => ({
          categories: pattern,
        }));
      }
    }

    // Filter by price range
    if (req.query.minPrice) {
      filter.price = {
        ...(filter.price || {}),
        $gte: parseFloat(req.query.minPrice),
      };
    }

    if (req.query.maxPrice) {
      filter.price = {
        ...(filter.price || {}),
        $lte: parseFloat(req.query.maxPrice),
      };
    }

    // Filter by release date range
    if (req.query.fromDate) {
      filter.release_date = {
        ...(filter.release_date || {}),
        $gte: new Date(req.query.fromDate),
      };
    }

    if (req.query.toDate) {
      filter.release_date = {
        ...(filter.release_date || {}),
        $lte: new Date(req.query.toDate),
      };
    }

    // Filter by platform compatibility
    if (req.query.windows === "true") {
      filter.windows = true;
    }

    if (req.query.mac === "true") {
      filter.mac = true;
    }

    if (req.query.linux === "true") {
      filter.linux = true;
    }

    // Execute query with pagination and sorting
    const games = await Game.find(filter).sort(sort).skip(skip).limit(limit);

    // Get total count for pagination metadata
    const total = await Game.countDocuments(filter);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    res.render("main.ejs", {
      title: "Catalogue",
      body: "./pages/allGames",
      games,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        hasNext,
        hasPrev,
        limit,
      },
      query: req.query
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

// api fetching Game detail page
router.get("/game/:id", authenticateUser, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }
    res.render("main.ejs", {
      title: game.name,
      body: "./pages/singleGame",
      game
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to load game details",
      error: err.message,
    });
  }
});

module.exports = router;
