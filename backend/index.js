const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');
const { logger } = require('./middleware/loggerMiddleware');
const errorHandler = require('./middleware/errorMiddleware');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use('/', employeeRoutes);
app.use('/', authRoutes);

// Basic root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
