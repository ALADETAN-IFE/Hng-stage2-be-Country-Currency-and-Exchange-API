const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { connectDB } = require("./config/database");
const countryRoutes = require("./routes/countryRoutes");
const statusRoutes = require("./routes/statusRoutes");

// Configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: "*", 
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

// Swagger UI
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: "Too many requests, please try again later.",
});

app.use(limiter);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Routes
app.use("/countries", countryRoutes);
app.use("/status", statusRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Country Currency & Exchange API',
    status: 'running',
    endpoints: {
      'POST /countries/refresh': 'Fetch and cache countries from external APIs',
      'GET /countries': 'Get all countries (supports ?region=Africa, ?currency=NGN, ?sort=gdp_desc)',
      'GET /countries/:name': 'Get one country by name',
      'DELETE /countries/:name': 'Delete a country',
      'GET /status': 'Get API status with total countries and last refresh time',
      'GET /countries/image': 'Get summary image'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Don't auto-start server in test environment
if (require.main === module || process.env.NODE_ENV !== 'test') {
  const startServer = async () => {
    try {
      await connectDB();
      
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();
}

module.exports = app;
