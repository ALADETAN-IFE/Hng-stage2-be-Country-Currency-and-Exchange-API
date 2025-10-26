# Setup Guide - Country Currency & Exchange API

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up MongoDB

You have two options:

#### Option A: Local MongoDB
```bash
# Install MongoDB locally
# On Windows, download from: https://www.mongodb.com/try/download/community
# Or use chocolatey: choco install mongodb
# Or use WSL and install via apt-get

# Start MongoDB service
# On Windows: services.msc -> find "MongoDB" and start it
```

#### Option B: MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free cluster
4. Get your connection string (mongodb+srv://...)
5. Add it to your `.env` file

### 3. Create Environment File

Create a `.env` file in the root directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/country_currency_api
```

For MongoDB Atlas, use:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/country_currency_api
```

### 4. Start the Server
```bash
npm start
```

### 5. Refresh the Data
```bash
curl -X POST http://localhost:5000/countries/refresh
```

## Running Tests

### With MongoDB Available
```bash
# Make sure MongoDB is running
npm test
```

### Without MongoDB
```bash
# Tests will skip database-dependent tests
npm test
```

The tests are designed to handle both scenarios gracefully.

## Troubleshooting

### "Client must be connected before running operations"
- **Solution**: Start MongoDB locally or configure MongoDB Atlas connection in `.env`

### "MongoDB not available" in tests
- **Solution**: This is expected if MongoDB isn't running. Tests will skip database operations.

### Canvas/Jimp Installation Issues
- **Solution**: Already fixed! We're using `jimp` which is pure JavaScript and works on Windows.

## API Endpoints

Once running, test the endpoints:

```bash
# Get all countries
curl http://localhost:5000/countries

# Get countries by region
curl http://localhost:5000/countries?region=Africa

# Get countries by currency
curl http://localhost:5000/countries?currency=NGN

# Sort by GDP
curl http://localhost:5000/countries?sort=gdp_desc

# Get one country
curl http://localhost:5000/countries/Nigeria

# Get status
curl http://localhost:5000/status

# Get summary image
curl http://localhost:5000/countries/image
```

## Production Deployment

### On Railway
1. Push to GitHub
2. Connect to Railway
3. Add environment variables in Railway dashboard
4. Deploy!

### On Heroku
1. Install Heroku CLI
2. `heroku create your-app-name`
3. `heroku addons:create mongolab:sandbox` (free tier)
4. `git push heroku main`

### On AWS / PXXL
1. Set up MongoDB Atlas (free tier available)
2. Configure environment variables
3. Deploy your app

## Notes

- **Cache Directory**: Generated images are saved in `cache/` directory (gitignored)
- **Database**: Uses MongoDB with Mongoose ODM
- **Image Generation**: Uses Jimp (pure JavaScript, no native dependencies)
- **Tests**: Gracefully handle missing MongoDB

