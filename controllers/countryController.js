const axios = require('axios');
const Country = require('../models/Country');
const RefreshMetadata = require('../models/RefreshMetadata');
const { generateSummaryImage } = require('../utils/generateImage');
const fs = require('fs');
const path = require('path');

// Helper function to get random multiplier between 1000 and 2000
const getRandomMultiplier = () => {
  return Math.random() * 1000 + 1000; // Random between 1000-2000
};

// POST /countries/refresh - Fetch and cache countries
const refreshCountries = async (req, res) => {
  try {
    // Fetch countries from restcountries API
    const countriesResponse = await axios.get(
      'https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies'
    ).catch(error => {
      if (error) {
        throw new Error(`restcountries.com: ${error.message || 'Failed to fetch'}`);
      }
    });

    // Fetch exchange rates
    const exchangeResponse = await axios.get('https://open.er-api.com/v6/latest/USD')
      .catch(error => {
        if (error) {
          throw new Error(`open.er-api.com: ${error.message || 'Failed to fetch'}`);
        }
      });

    if (!countriesResponse || !exchangeResponse) {
      return res.status(503).json({
        error: 'External data source unavailable',
        details: 'Could not fetch data from external APIs'
      });
    }

    const countries = countriesResponse.data;
    const exchangeRates = exchangeResponse.data.rates;
    let processedCount = 0;

    // Process each country
    for (const country of countries) {
      // Extract first currency code if available
      let currencyCode = null;
      if (country.currencies && country.currencies.length > 0) {
        currencyCode = country.currencies[0].code;
      }

      // Get exchange rate if currency code exists
      let exchangeRate = null;
      if (currencyCode && exchangeRates[currencyCode]) {
        exchangeRate = exchangeRates[currencyCode];
      }

      // Calculate estimated GDP
      let estimatedGdp = 0;
      if (exchangeRate && currencyCode) {
        const multiplier = getRandomMultiplier();
        estimatedGdp = (country.population * multiplier) / exchangeRate;
      }

      // Prepare country data
      const countryData = {
        name: country.name,
        capital: country.capital || null,
        region: country.region || null,
        population: country.population,
        currency_code: currencyCode,
        exchange_rate: exchangeRate,
        estimated_gdp: estimatedGdp || null,
        flag_url: country.flag || null,
        last_refreshed_at: new Date()
      };

      // Upsert (update if exists, insert if not)
      await Country.findOneAndUpdate(
        { name: country.name },
        countryData,
        { upsert: true, new: true }
      );

      processedCount++;
    }

    // Update metadata
    const totalCount = await Country.countDocuments();
    await RefreshMetadata.findOneAndUpdate(
      { _id: 1 },
      {
        total_countries: totalCount,
        last_refreshed_at: new Date()
      },
      { upsert: true, new: true }
    );

    // Get all countries for image generation
    const allCountries = await Country.find().lean();

    // Generate summary image
    const metadata = await RefreshMetadata.findOne({ _id: 1 });
    await generateSummaryImage(allCountries, metadata || { total_countries: totalCount, last_refreshed_at: new Date() });

    res.status(200).json({
      message: 'Countries refreshed successfully',
      total_processed: processedCount,
      total_in_database: totalCount
    });
  } catch (error) {
    console.error('Refresh error:', error.message);
    
    if (error.message.includes('restcountries.com') || error.message.includes('open.er-api.com')) {
      return res.status(503).json({
        error: 'External data source unavailable',
        details: error.message
      });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /countries - Get all countries with filters and sorting
const getAllCountries = async (req, res) => {
  try {
    // Check if mongoose is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json([]);
    }

    let query = {};

    // Apply filters
    if (req.query.region) {
      query.region = new RegExp(req.query.region, 'i');
    }

    if (req.query.currency) {
      query.currency_code = req.query.currency.toUpperCase();
    }

    // Execute query
    let countries = await Country.find(query).lean();

    // Apply sorting
    if (req.query.sort) {
      const sortParam = req.query.sort.toLowerCase();
      if (sortParam === 'gdp_desc') {
        countries.sort((a, b) => (b.estimated_gdp || 0) - (a.estimated_gdp || 0));
      } else if (sortParam === 'gdp_asc') {
        countries.sort((a, b) => (a.estimated_gdp || 0) - (b.estimated_gdp || 0));
      } else if (sortParam === 'population_desc') {
        countries.sort((a, b) => b.population - a.population);
      } else if (sortParam === 'population_asc') {
        countries.sort((a, b) => a.population - b.population);
      }
    }

    res.status(200).json(countries);
  } catch (error) {
    console.error('Get all countries error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /countries/:name - Get one country
const getCountryByName = async (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({
        error: 'Validation failed',
        details: { name: 'is required' }
      });
    }

    const country = await Country.findOne({ name: new RegExp(`^${name}$`, 'i') });

    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }

    res.status(200).json(country);
  } catch (error) {
    console.error('Get country by name error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /countries/:name - Delete a country
const deleteCountryByName = async (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({
        error: 'Validation failed',
        details: { name: 'is required' }
      });
    }

    const country = await Country.findOneAndDelete({ name: new RegExp(`^${name}$`, 'i') });

    if (!country) {
      return res.status(404).json({ error: 'Country not found' });
    }

    // Update metadata
    const totalCount = await Country.countDocuments();
    await RefreshMetadata.findOneAndUpdate(
      { _id: 1 },
      { total_countries: totalCount },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: 'Country deleted successfully' });
  } catch (error) {
    console.error('Delete country error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /status - Get status
const getStatus = async (req, res) => {
  try {
    // Check if mongoose is connected
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        total_countries: 0,
        last_refreshed_at: null
      });
    }

    const metadata = await RefreshMetadata.findOne({ _id: 1 });

    if (!metadata) {
      return res.status(200).json({
        total_countries: 0,
        last_refreshed_at: null
      });
    }

    res.status(200).json({
      total_countries: metadata.total_countries,
      last_refreshed_at: metadata.last_refreshed_at
    });
  } catch (error) {
    console.error('Get status error:', error.message);
    
    // Return default status if DB error
    res.status(200).json({
      total_countries: 0,
      last_refreshed_at: null
    });
  }
};

// GET /countries/image - Serve summary image
const getSummaryImage = async (req, res) => {
  try {
    const imagePath = path.join(__dirname, '../cache/summary.png');

    // Check if image exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Summary image not found' });
    }

    // Serve the image
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Get image error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  refreshCountries,
  getAllCountries,
  getCountryByName,
  deleteCountryByName,
  getStatus,
  getSummaryImage
};

