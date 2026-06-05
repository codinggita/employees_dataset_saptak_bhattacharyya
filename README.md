# Employee Hub - Full Stack Management Platform (MERN)

A highly optimized, production-ready full-stack application for managing and analyzing an organization's employee dataset. Built using the **MERN Stack (MongoDB, Express, React, Node.js)**, this platform offers a sleek, dark-themed responsive glassmorphic UI integrated with a robust backend using the **MVC (Model-View-Controller)** pattern.

The platform handles a raw dataset of **4,109 employee records** and features secure JWT authentication, role-based access control (RBAC), advanced MongoDB Aggregation pipelines for statistical reporting, and system health tail logging.

---

## 📁 Project Structure

```text
employees_dataset_saptak_bhattacharyya/
├── backend/                  # MVC Node.js/Express Backend API
│   ├── config/               # DB Connection logic
│   ├── controllers/          # Database operations & request handlers
│   ├── middleware/           # Security, audit, rate limiter, and error layer
│   ├── models/               # Mongoose schemas & indexes
│   ├── routes/               # API endpoints routing
│   └── index.js              # Server entry point
│
└── frontend/                 # Vite-powered React Frontend App
    ├── public/               # Static assets & SVG icons
    ├── src/
    │   ├── assets/           # Media & graphics assets
    │   ├── components/       # Reusable React UI views
    │   │   ├── Analytics.jsx     # Aggregation metrics & bar charts
    │   │   ├── EmployeeForm.jsx  # Employee profile onboard/edit form
    │   │   ├── EmployeeList.jsx  # Staff Directory list, search & filters
    │   │   ├── Login.jsx         # Sign In, registration, OTP password reset
    │   │   ├── Navbar.jsx        # Sidebar navigation & user details
    │   │   ├── Profile.jsx       # Personal preferences & password updates
    │   │   └── SystemHealth.jsx  # Admin diagnostics & logs tail console
    │   ├── App.jsx           # Root layout & view coordinator
    │   ├── index.css         # Styling system & dark theme tokens
    │   └── main.jsx          # Frontend entry point
    └── vite.config.js        # Build configuration
```

---

## ✨ Features

### 🔐 1. Identity & Security (Auth)
* **JWT-Based Authentication**: Secure login, account registration, and session token persistence.
* **OTP Password Reset**: Dynamic code simulation for secure password recovery.
* **Role-Based Access Control (RBAC)**: Distinct permissions for `Admin` and `Employee` roles.
* **Profile Management**: Live account details updates and password change configuration.

### 📁 2. Employee Directory (CRUD)
* **Rich Search**: Deep instant searching across names, skills, domains, cities, and countries.
* **Multi-Filter Framework**: Filter staff by industrial domain and primary technical skills.
* **Sorting Engine**: Sort dynamically by name, experience levels, and geographical location.
* **Onboarding & Offboarding**: Direct staff addition, modification, and deletion (restricted to Admins).

### 📊 3. Statistical Reports (Analytics)
* **MongoDB Aggregations**: Real-time analytical statistics fetched via native aggregation pipelines.
* **Top Technical Skills**: Charted distribution of primary tech expertise.
* **Top Industry Domains**: Distribution of domains across the team.
* **Location Hotspots**: Geographical density reporting by country, state, and city.

### ⚙️ 4. System Diagnostics
* **Live System Health**: API status indicator, uptime tracker, and server environment metadata.
* **Dynamic Log Console**: Tail system audit logs (HTTP requests, database changes, middleware executions) in real-time (restricted to Admins).
* **Cache Management**: Instantly flush cache and temporary in-memory collections.

---

## 🚀 Installation & Local Setup

### Prerequisites
* **Node.js** (v18 or higher)
* **npm** (v9 or higher)
* **MongoDB Atlas** database connection

---

### Step 1: Run the Backend API

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend/` folder:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.sno1mef.mongodb.net/employee_db
   JWT_SECRET=supersecretkey
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

### Step 2: Run the Frontend Client

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `frontend/` folder:
   ```env
   VITE_API_URL=http://localhost:5000
   ```
4. Start the Vite client dev server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to: **[http://localhost:5173](http://localhost:5173)**

---

## 🔗 Live API Documentation Link

Explore all REST API routes, schemas, request payloads, and query structures:
👉 **[Live Postman API Documentation](https://documenter.getpostman.com/view/50841251/2sBXwntBts)**