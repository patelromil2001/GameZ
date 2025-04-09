const express = require('express');
const router = express.Router();
const Game = require('../models/Game');



// VAISAKH  - Pagination for game catalog
router.get('/games/page/:page', async (req, res) => {
  try { // DEVWRAT RAVAL
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'name_asc':
          sortOption = { name: 1 };
          break;
        case 'name_desc':
          sortOption = { name: -1 };
          break;
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'date_asc':
          sortOption = { release_date: 1 };
          break;
        case 'date_desc':
          sortOption = { release_date: -1 };
          break;
        case 'rating_desc':
          // We'll need custom handling for this since it's a virtual
          break;
        default:
          sortOption = { name: 1 };
      }
    }
  }})

module.exports = router;