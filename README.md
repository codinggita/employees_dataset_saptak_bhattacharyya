# Employee Dataset MVC Backend API (MERN Stack)

A highly optimized, industry-standard, and beginner-friendly **Node.js, Express.js, and MongoDB (Mongoose)** backend built using the **MVC (Model-View-Controller)** architecture. 

This backend is designed to handle a large raw dataset of **4,109 employee records**, featuring deep search, pagination, sorting, dynamic queries, custom middleware layers, secure JWT authentication with role-based access control, and native MongoDB Aggregation pipelines for statistical analytics reports.

---

## 📁 Folder Structure (MVC)

This project strictly adheres to the standard MVC separation of concerns, dividing route handling, request/response validation, database/business operations, and data models cleanly:

```text
backend/
├── config/
│   └── db.js                 # MongoDB Atlas connection logic
├── controllers/
│   ├── authController.js     # Database operations & request handlers for Auth & Tokens
│   └── employeeController.js # Database operations, Aggregations & handlers for Employees
├── middleware/
│   ├── auditMiddleware.js    # Logs POST/PUT/DELETE actions for audit history
│   ├── authMiddleware.js     # JWT token extraction and Admin role validation
│   ├── errorMiddleware.js    # Centralized global error handler
│   ├── loggerMiddleware.js   # Custom request logging and timing headers
│   ├── rateLimitMiddleware.js# API abuse rate limiter
│   └── validationMiddleware.js# Custom request payload validation layer
├── models/
│   └── employeeModel.js      # Mongoose nested schema design with indexing
├── routes/
│   ├── authRoutes.js         # Express router for Authentication & JWT endpoints
│   └── employeeRoutes.js     # Express router for CRUD, Analytics & Stats
├── .env                      # Local environment configuration file
├── index.js                  # Main server entry file
├── package.json              # NPM dependencies & boot scripts
└── node_modules/             # Dependency libraries
```

---

## 🚀 Installation & Local Setup

### 1. Clone & Navigate
Ensure you are in the backend directory of the project:
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables (`.env`)
Create a `.env` file exactly in the root of the `backend/` folder and paste your configurations:
```env
PORT=5000
MONGO_URI=mongodb+srv://saptak:pass123@cluster0.sno1mef.mongodb.net/employee_db?retryWrites=true&w=majority
JWT_SECRET=supersecretkey
```

### 4. Launch the Development Server
```bash
npm run dev
```
The server will boot up and establish a live connection to MongoDB Atlas:
```text
Server running on port 5000
MongoDB Connected: cluster0.sno1mef.mongodb.net
```

---

## 🔗 Live API Documentation Link

You can view the beautifully rendered public web version of this API documentation (including all requests, request bodies, query parameters, and example JSON payloads) at:
👉 **[Live Postman API Documentation](https://documenter.getpostman.com/view/50841251/2sBXwntBts)**