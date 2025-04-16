const express = require("express");
const router = express.Router();
const Game = require("../models/games");
const auth = require("../middleware/auth");

// api fetching all the games
router.get("/all-games", auth, async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
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

    // Filter by genres - using regex
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

    // Filter by categories - using regex
    if (req.query.categories) {
      const categoriesList = req.query.categories
        .split(",")
        .map((category) => category.trim());

      // Create an array of regex patterns for each category
      const categoryPatterns = categoriesList.map(
        (category) => new RegExp(`'${category}'`, "i")
      );

      // If we already have an $or from genres, handle merging
      if (filter.$or) {
        const existingOr = filter.$or;
        const categoryOr = categoryPatterns.map((pattern) => ({
          categories: pattern,
        }));
        filter.$and = [{ $or: existingOr }, { $or: categoryOr }];
        delete filter.$or;
      } else {
        filter.$or = categoryPatterns.map((pattern) => ({ categories: pattern }));
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

    // Execute query with pagination + sorting
    const games = await Game.find(filter).sort(sort).skip(skip).limit(limit);

    // Get total count
    const total = await Game.countDocuments(filter);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // =====================
    // NEW: Ellipses Pagination
    // =====================
    const pageNumbers = [];
    // how many pages to show around the current page
    const pagesToShow = 2; // you can tweak this to 1, 3, etc.

    // Always push page 1
    pageNumbers.push(1);

    // start & end range around current page
    let start = Math.max(2, page - pagesToShow);
    let end = Math.min(totalPages - 1, page + pagesToShow);

    // If there's a gap after page 1, add ellipses
    if (start > 2) {
      pageNumbers.push("...");
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    // If there's a gap before the last page, add ellipses
    if (end < totalPages - 1) {
      pageNumbers.push("...");
    }

    // Always push the last page if totalPages > 1
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    res.render("layout.ejs", {
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
        pageNumbers, // pass array to EJS
      },
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
router.get("/game/:id", auth, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }
    res.render("layout.ejs", {
      title: game.name,
      body: "./pages/singleGame",
      game,
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

router.get("/find", auth, async (req, res) => {
  try {
    res.render("layout.ejs", {
      title: "Find Games",
      body: "./pages/findGames",
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

// Add this to routes/games.js
router.get("/search", auth, async (req, res) => {
  try {
    const query = req.query.query;
    const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined;
    const genres = req.query.genres
      ? (Array.isArray(req.query.genres) ? req.query.genres : [req.query.genres])
      : undefined;
    const windows = req.query.windows === "true";
    const mac = req.query.mac === "true";
    const linux = req.query.linux === "true";

    let filter = {};

    // Add query search
    if (query) {
      filter.name = { $regex: query, $options: "i" };
    }
    // Add price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }
    // Add genres filter
    if (genres && genres.length > 0) {
      filter.genres = { $in: genres.map((genre) => new RegExp(`'${genre}'`, "i")) };
    }
    // Add platform filters
    if (windows) filter.windows = true;
    if (mac) filter.mac = true;
    if (linux) filter.linux = true;

    // Execute query
    const games = await Game.find(filter).limit(20);

    res.render("layout.ejs", {
      title: "Search Results",
      body: "./pages/searchResults",
      games,
      query,
    });
  } catch (error) {
    console.error("Error searching games:", error);
    res.status(500).json({
      success: false,
      error: "Server Error",
    });
  }
});

module.exports = router;
