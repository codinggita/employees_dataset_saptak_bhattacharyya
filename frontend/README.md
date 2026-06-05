# Employee Hub - Frontend Client

A responsive React single-page application built on Vite. It features a modern, dark-themed dashboard using custom glassmorphic CSS, interactive layout states, and integrated API communication with the Employee Hub MVC backend.

---

## 🛠️ Tech Stack & Styling
* **Framework**: React 19 (JSX)
* **Build Tool**: Vite 8 with HMR (Hot Module Replacement)
* **Styling**: Pure Vanilla CSS featuring dark-mode CSS custom variables, gradients, blur backdrop-filters, and clean typography (`Outfit` / `Inter` fallback).
* **Linting**: ESLint v10 with standard React/Hooks guidelines.

---

## 📁 Key Components
* **`App.jsx`**: Core coordinator managing view switching, authentication tokens, global states, and automated alert banners.
* **`Navbar.jsx`**: Left sidebar containing logo branding, responsive menu items, avatar initials extraction, role badges, and logout handlers.
* **`Login.jsx`**: Handles multi-mode authorization: Login, Account Registration, Forgot Password OTP, and Reset Password.
* **`EmployeeList.jsx`**: Staff Directory displaying paginated cards, summary metrics, instant searches, skill/domain selectors, and admin management options (onboarding/deletion).
* **`EmployeeForm.jsx`**: Validation form overlay handling profile data structure to conform with DB schemas.
* **`Analytics.jsx`**: Multi-dimensional statistical charts summarizing skill trends, domain counts, certification popularity, and geographical staff density.
* **`SystemHealth.jsx`**: Admin dashboard reporting API version details, uptime diagnostics, cache controls, and live HTTP audit logs.

---

## 🚀 Dev Setup & Run

### 1. Configure API Endpoint
Create a `.env` file in the root of the `frontend/` folder to hook up the backend:
```env
VITE_API_URL=http://localhost:5000
```

### 2. Run Local Development Server
Execute the following commands from the frontend directory:
```bash
# Install dependencies
npm install

# Boot development server
npm run dev
```

The application will run locally at: **[http://localhost:5173](http://localhost:5173)**.
