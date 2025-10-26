# HNG Internship - Backend Wizards Stage 2 (Country Currency & Exchange API)

This is my submission for the **HNG Internship Stage 2 (Backend Wizards)** task.  
It's a RESTful API service that fetches country data from external APIs, calculates exchange rates and estimated GDP, and stores them in MongoDB using Mongoose.

Built using **Node.js**, **Express.js**, **MongoDB**, and **Canvas**.

---

## 🚀 Features

- **POST** `/countries/refresh` - Fetch all countries and exchange rates, then cache them in the database
- **GET** `/countries` - Get all countries with optional filters and sorting
  - Query params: `?region=Africa` | `?currency=NGN` | `?sort=gdp_desc`
- **GET** `/countries/:name` - Get one country by name
- **DELETE** `/countries/:name` - Delete a country record
- **GET** `/status` - Show total countries and last refresh timestamp
- **GET** `/countries/image` - Serve summary image with top 5 countries by GDP

### Currency Handling
- If a country has multiple currencies, only the first one is stored
- If currencies array is empty, currency fields are set to null
- If currency is not found in exchange rates API, fields are set to null
- Updates existing countries or inserts new ones (case-insensitive)

### Image Generation
- Automatically generates a summary image after each refresh
- Shows total countries, top 5 by GDP, and last refresh timestamp
- Saved to `cache/summary.png`

---

## 🧠 Technologies Used

- **Node.js** — Runtime environment  
- **Express.js** — Web framework  
- **MongoDB** — NoSQL database
- **Mongoose** — MongoDB ODM
- **Axios** — HTTP client for external APIs
- **Canvas** — Image generation
- **Morgan** — Logging middleware  
- **dotenv** — Environment variable management  
- **express-rate-limit** — Rate limiting middleware  
- **CORS** — Cross-origin resource sharing  
- **nodemon** — Development server

---

## 👤 About Me

**Aladetan Fortune Ifeloju (IfeCodes)**  
A passionate **Full Stack Developer** who enjoys building scalable and user-friendly web applications.  
I solve real-life problems with my projects and constantly strive to learn and improve.  

- 💻 [GitHub](https://github.com/ALADETAN-IFE)  
- 🐦 [Twitter](https://x.com/ifeCodes_)  
- 💼 [LinkedIn](https://www.linkedin.com/in/fortune-ife-aladetan-458ab136a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app)

---

## ⚙️ How to Run Locally

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Installation Steps

```bash
# Clone this repository
git clone https://github.com/ALADETAN-IFE/hng-stage2-be-Country-Currency-and-Exchange-API.git

# Navigate into the folder
cd hng-stage2-be-Country-Currency-and-Exchange-API

# Install dependencies
npm install

# Create a .env file and add the following:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/country_currency_api
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/country_currency_api

# Start the server
npm start
```

The server will start on `http://localhost:5000`

---

## 📦 Environment Variables

Create a `.env` file in the root directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/country_currency_api
```

### For Production (MongoDB Atlas)
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/country_currency_api
```

---

## 🧪 Testing Endpoints

### 1. Refresh Countries Data
```bash
curl -X POST http://localhost:5000/countries/refresh
```

### 2. Get All Countries
```bash
curl http://localhost:5000/countries
```

### 3. Filter by Region
```bash
curl http://localhost:5000/countries?region=Africa
```

### 4. Filter by Currency
```bash
curl http://localhost:5000/countries?currency=NGN
```

### 5. Sort by GDP
```bash
curl http://localhost:5000/countries?sort=gdp_desc
```

### 6. Get Specific Country
```bash
curl http://localhost:5000/countries/Nigeria
```

### 7. Delete Country
```bash
curl -X DELETE http://localhost:5000/countries/Nigeria
```

### 8. Get Status
```bash
curl http://localhost:5000/status
```

### 9. Get Summary Image
```bash
curl http://localhost:5000/countries/image
```

---

## 📊 Sample Response

### GET /countries?region=Africa

```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-22T18:00:00Z"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Ghana",
    "capital": "Accra",
    "region": "Africa",
    "population": 31072940,
    "currency_code": "GHS",
    "exchange_rate": 15.34,
    "estimated_gdp": 3029834520.6,
    "flag_url": "https://flagcdn.com/gh.svg",
    "last_refreshed_at": "2025-10-22T18:00:00Z"
  }
]
```

### GET /status

```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-22T18:00:00Z"
}
```

---

## 🔧 External APIs Used

- **Countries API**: https://restcountries.com/v2/all
- **Exchange Rates API**: https://open.er-api.com/v6/latest/USD

---

## 📝 Notes

- The API uses MongoDB for persistence
- Data is only updated when `/countries/refresh` is called
- Estimated GDP is calculated as: `population × random(1000–2000) ÷ exchange_rate`
- The summary image is generated after each successful refresh
- All endpoints return JSON responses

---

## 🐛 Error Handling

The API returns consistent JSON error responses:

- `400 Bad Request` - Validation failed or missing parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Unexpected server error
- `503 Service Unavailable` - External API unavailable

---

## 📄 License

ISC
