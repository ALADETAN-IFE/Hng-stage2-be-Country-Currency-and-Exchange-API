const express = require('express');
const { getStatus } = require('../controllers/countryController');

const router = express.Router();

// GET /status - Get API status
router.get('/', getStatus);

module.exports = router;

