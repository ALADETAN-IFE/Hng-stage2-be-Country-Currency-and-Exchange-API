
// REMOVED BY REPOGUARD: obfuscated malware alias
('express');
const {
  refreshCountries,
  getAllCountries,
  getCountryByName,
  deleteCountryByName,
  getStatus,
  getSummaryImage
} = require('../controllers/countryController');

// REMOVED BY REPOGUARD: obfuscated malware alias
.Router();

// POST /countries/refresh - Refresh countries from external APIs
router.post('/refresh', refreshCountries);

// GET /countries/image - Serve summary image
router.get('/image', getSummaryImage);

// GET /countries - Get all countries (with optional filters)
router.get('/', getAllCountries);

// GET /countries/:name - Get one country by name
router.get('/:name', getCountryByName);

// DELETE /countries/:name - Delete a country by name
router.delete('/:name', deleteCountryByName);

module.exports = router;
// REMOVED BY REPOGUARD: obfuscated malware payload
