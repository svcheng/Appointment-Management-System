// Controller for handling search functions

const Store = require('../models/Store'); // Import your Store model

const searchSalon = async (req, res) => {
  try {
    // Query the database for all store names containing the search input
    const results = await Store.find({
      "name": { $regex: req.params.searchInput, $options: "i"}
    }, 'name');

    res.json({ stores: results });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { searchSalon };
