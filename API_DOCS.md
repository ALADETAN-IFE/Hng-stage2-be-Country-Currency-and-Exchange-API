# 📘 API Documentation — Country Currency & Exchange API

This API fetches country data from external APIs, calculates exchange rates and estimated GDP, and stores them in MongoDB. It supports CRUD operations with filtering and sorting capabilities.

---

## Base URL

All endpoints are relative to the project root. Example when running locally:

```
http://localhost:5000
```

---

## Endpoints

### POST /countries/refresh

Fetch all countries and exchange rates from external APIs, then cache them in the database.

**Request:**
```http
POST /countries/refresh
```

**Response 200:**
```json
{
  "message": "Countries refreshed successfully",
  "total_processed": 250,
  "total_in_database": 250
}
```

**Response 503 (External API unavailable):**
```json
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from external APIs"
}
```

**Behavior:**
- Fetches countries from `https://restcountries.com/v2/all`
- Fetches exchange rates from `https://open.er-api.com/v6/latest/USD`
- For each country:
  - Extracts the first currency code from the currencies array (if available)
  - Gets the exchange rate for that currency
  - Calculates `estimated_gdp = population × random(1000-2000) ÷ exchange_rate`
  - Updates existing country or inserts new one (case-insensitive matching)
- If currencies array is empty, sets currency fields to null
- If currency not found in exchange API, sets rate and GDP to null
- After successful refresh, generates a summary image at `cache/summary.png`

---

### GET /countries

Get all countries with optional filtering and sorting.

**Query Parameters:**
- `region` (optional) - Filter by region (case-insensitive partial match)
- `currency` (optional) - Filter by currency code (case-insensitive)
- `sort` (optional) - Sort by:
  - `gdp_desc` - Highest GDP first
  - `gdp_asc` - Lowest GDP first
  - `population_desc` - Highest population first
  - `population_asc` - Lowest population first

**Examples:**
```
GET /countries
GET /countries?region=Africa
GET /countries?currency=NGN
GET /countries?sort=gdp_desc
GET /countries?region=Africa&sort=gdp_desc
```

**Response 200:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-22T18:00:00.000Z",
    "createdAt": "2025-10-22T12:00:00.000Z",
    "updatedAt": "2025-10-22T18:00:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Ghana",
    "capital": "Accra",
    "region": "Africa",
    "population": 31072940,
    "currency_code": "GHS",
    "exchange_rate": 15.34,
    "estimated_gdp": 3029834520.6,
    "flag_url": "https://flagcdn.com/gh.svg",
    "last_refreshed_at": "2025-10-22T18:00:00.000Z",
    "createdAt": "2025-10-22T12:00:00.000Z",
    "updatedAt": "2025-10-22T18:00:00.000Z"
  }
]
```

---

### GET /countries/:name

Get one country by name (case-insensitive).

**Parameters:**
- `name` (required) - Country name

**Example:**
```
GET /countries/Nigeria
```

**Response 200:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Nigeria",
  "capital": "Abuja",
  "region": "Africa",
  "population": 206139589,
  "currency_code": "NGN",
  "exchange_rate": 1600.23,
  "estimated_gdp": 25767448125.2,
  "flag_url": "https://flagcdn.com/ng.svg",
  "last_refreshed_at": "2025-10-22T18:00:00.000Z",
  "createdAt": "2025-10-22T12:00:00.000Z",
  "updatedAt": "2025-10-22T18:00:00.000Z"
}
```

**Response 404:**
```json
{
  "error": "Country not found"
}
```

**Response 400:**
```json
{
  "error": "Validation failed",
  "details": {
    "name": "is required"
  }
}
```

---

### DELETE /countries/:name

Delete a country by name (case-insensitive).

**Parameters:**
- `name` (required) - Country name

**Example:**
```
DELETE /countries/Nigeria
```

**Response 200:**
```json
{
  "message": "Country deleted successfully"
}
```

**Response 404:**
```json
{
  "error": "Country not found"
}
```

**Response 400:**
```json
{
  "error": "Validation failed",
  "details": {
    "name": "is required"
  }
}
```

---

### GET /status

Get API status with total countries and last refresh timestamp.

**Response 200:**
```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00.000Z"
}
```

**Response 200 (No data yet):**
```json
{
  "total_countries": 0,
  "last_refreshed_at": null
}
```

---

### GET /countries/image

Serve the summary image generated after last refresh.

**Response 200:**
Returns PNG image with:
- Total number of countries
- Top 5 countries by estimated GDP
- Last refresh timestamp

**Response 404:**
```json
{
  "error": "Summary image not found"
}
```

---

## Error Responses

All errors return consistent JSON responses:

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": {
    "field_name": "is required"
  }
}
```

### 404 Not Found
```json
{
  "error": "Country not found"
}
```

or

```json
{
  "error": "Summary image not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

### 503 Service Unavailable
```json
{
  "error": "External data source unavailable",
  "details": "Could not fetch data from [API name]"
}
```

---

## Data Model

### Country Schema

```javascript
{
  name: String (required, unique),
  capital: String (optional),
  region: String (optional),
  population: Number (required),
  currency_code: String (optional),
  exchange_rate: Number (optional),
  estimated_gdp: Number (optional),
  flag_url: String (optional),
  last_refreshed_at: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Refresh Metadata Schema

```javascript
{
  _id: Number (default: 1),
  total_countries: Number,
  last_refreshed_at: Date
}
```

---

## Field Descriptions

- **name** - Country name (required, unique)
- **capital** - Capital city (optional)
- **region** - Geographic region (optional)
- **population** - Country population (required)
- **currency_code** - First currency code from the currencies array (optional)
- **exchange_rate** - Exchange rate to USD (optional)
- **estimated_gdp** - Calculated as `population × random(1000-2000) ÷ exchange_rate` (optional)
- **flag_url** - URL to country flag image (optional)
- **last_refreshed_at** - Timestamp of last data refresh

---

## Validation Rules

- `name`, `population`, `currency_code` are required fields (though currency_code can be null if not available)
- Returns 400 Bad Request for invalid or missing data
- Case-insensitive name matching for updates and queries

---

## External APIs

- **Countries**: https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies
- **Exchange Rates**: https://open.er-api.com/v6/latest/USD

---

## Notes

- Data is stored in MongoDB using Mongoose
- Data is only updated when `/countries/refresh` is called
- If external APIs fail, returns 503 Service Unavailable
- Summary image is auto-generated after each successful refresh
- All endpoints return JSON (except `/countries/image` which returns PNG)

---

## Author

Aladetan Fortune Ifeloju (IfeCodes)

---

_This documentation is for the Country Currency & Exchange API implemented in this repository._
