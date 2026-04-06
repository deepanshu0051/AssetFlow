# AssetFlow - Asset Management System

AssetFlow is a robust, full-stack asset management solution designed for tracking machinery, plants, and production data. Built with the MERN stack, it offers a secure, real-time interface for managing industrial assets with integrated GST record tracking.

## 🚀 Features

- **Authentication & Security:**
  - Secure JWT-based authentication.
  - Role-based Protected Routes.
  - Custom deep sanitization against Mongo Injection and XSS.
  - Rate limiting and security headers (Helmet).
  - Password encryption using Bcrypt.

- **Asset Management:**
  - Full CRUD operations for Machine assets.
  - Real-time, multi-field search (Machine Name, Plant Name, Serial Number).
  - Soft-delete system with automated backup in a dedicated collection.
  - Dynamic GST credit calculation and tracking.

- **User Experience:**
  - Responsive Dashboard with key metrics.
  - Professional UI with Glassmorphism and dark mode support.
  - Real-time toast notifications for user actions.
  - Global search functionality.

## 🛠️ Tech Stack

**Frontend:**
- React 19 (Vite)
- React Router DOM
- Context API (Auth, Search, Theme, Toast)
- Lucide React Icons
- Axios for API communication

**Backend:**
- Node.js & Express 5
- MongoDB Atlas (Mongoose)
- JSON Web Token (JWT)
- Security: Helmet, Express Rate Limit

## 📋 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/deepanshu0051/AssetFlow.git
   cd AssetFlow
   ```

2. **Install dependencies:**
   ```bash
   # Install root, frontend, and backend dependencies automatically
   npm run install-all
   ```

3. **Environment Setup:**
   - Create a `.env` file in the root directory based on `.env.example`.
   - Update the `MONGODB_URI` with your connection string.
   - Set a strong `JWT_SECRET`.

4. **Run the project:**
   ```bash
   # Starts both frontend and backend concurrently
   npm run dev
   ```

## 📁 Project Structure

```
AssetFlow/
├── backend/            # Express server, models, controllers, routes
│   ├── config/         # Database configuration
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Security and auth middleware
│   ├── models/         # Mongoose schemas
│   └── routes/         # API endpoint definitions
├── frontend/           # React application (Vite)
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Global state management
│   │   ├── pages/      # View components
│   │   └── services/   # API abstraction layer
└── .env.example        # Environment variable template
```

## 📸 Screenshots
*(Add your project screenshots here once deployed or running)*

## 🔮 Future Improvements
- [ ] Export data to CSV/Excel functionality.
- [ ] Advanced analytics and graphing for GST spending.
- [ ] Multi-user permission levels (Admin, Editor, Viewer).
- [ ] Mobile app integration.

## 👤 Author
**Deepanshu**
- GitHub: [@deepanshu0051](https://github.com/deepanshu0051)

---
*Clean, Secure, and Scalable Asset Management.*
