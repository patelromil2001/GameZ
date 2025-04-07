// Sorting middleware for game
const sortingMiddleware = (req, res, next) => {
    // Default sort 
    const defaultSort = { name: 1 };
    
    // Get requested sort option from query params
    const sortOption = req.query.sort || 'name_asc';
    
    // Define available sort options
    const sortOptions = {
      'name_asc': { name: 1 },
      'name_desc': { name: -1 },
      'price_asc': { price: 1 },
      'price_desc': { price: -1 },
      'release_date_asc': { release_date: 1 },
      'release_date_desc': { release_date: -1 },
      'rating_asc': { positive_ratings: 1 },
      'rating_desc': { positive_ratings: -1 }
    };
    
    // Set the sort criteria based on the requested option
    req.sortCriteria = sortOptions[sortOption] || defaultSort;
    
    // Add sorting options to locals for use in templates
    res.locals.sortOptions = [
      { value: 'name_asc', label: 'Name (A-Z)', selected: sortOption === 'name_asc' },
      { value: 'name_desc', label: 'Name (Z-A)', selected: sortOption === 'name_desc' },
      { value: 'price_asc', label: 'Price (Low to High)', selected: sortOption === 'price_asc' },
      { value: 'price_desc', label: 'Price (High to Low)', selected: sortOption === 'price_desc' },
      { value: 'release_date_asc', label: 'Oldest First', selected: sortOption === 'release_date_asc' },
      { value: 'release_date_desc', label: 'Newest First', selected: sortOption === 'release_date_desc' },
      { value: 'rating_asc', label: 'Rating (Low to High)', selected: sortOption === 'rating_asc' },
      { value: 'rating_desc', label: 'Rating (High to Low)', selected: sortOption === 'rating_desc' }
    ];
    
    res.locals.currentSort = sortOption;
    
    next();
  };
  
  module.exports = sortingMiddleware;