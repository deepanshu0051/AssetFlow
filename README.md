# 🏭 AssetFlow - Advanced Asset Management Platform

AssetFlow is a robust, full-stack industrial asset management solution designed specifically for tracking machinery, plant allocations, and production data hierarchy. 
Built on the MERN stack with a React/Vite front-end, it offers an exceptionally secure, real-time interface for managing vast industrial assets alongside integrated GST record tracking.

---

## 🚀 Key Features

### 🛡️ Deep Authorization & Security
- **Strict Role-Based Access Control (RBAC):** Distinct interfaces and capabilities for `SuperAdmin` vs `Admin`.
- **Closed API Loops:** SuperAdmin registration is fundamentally disabled at the API level—ensuring no unauthorized creation of top-level accounts.
- **OTP Validations:** Admins undergo mandatory, strict, email-based OTP verification before generating accounts.
- **Sanitized Backend:** Data sanitization against MongoDB NoSQL Injection, XSS prevention, Helmet security headers, and Express Rate Limiting.
- **Bulletproof .env Loading:** A meticulously organized structural setup protects JWT secrets, email auth, and DB URIs.

### 🏭 Plant-Centric Architecture
- **Hierarchical Plant Layout:** SuperAdmins control global macro-data, diving into local operational zones (`Noida`, `Delhi`, `Mumbai`, `Greater Noida`).
- **Dynamic Asset Tracking:** Full CRUD capabilities where Admins manage their localized Plant Machines, and SuperAdmins hold omnipotent oversight.
- **Smart Analytics:** Lazy-loaded dashboards dynamically fetch machinery arrays correlated to the exact selected plant zone.

### 🔔 Real-Time Notification & Request Systems
- **Approval Engine:** Admins push Machine additions upstream. SuperAdmins parse the queue, dispatching "Approve" or "Reject" flows seamlessly.
- **Descriptive Event Logs:** System-wide broadcast logs. When an Admin force-deletes a machine, a comprehensive notification featuring the Machine Name and specific Actor Name is propagated to ALL SuperAdmins globally.
- **Soft-Deletion Data Preservation:** "Deleted" machines are not wiped—they undergo soft-migration into heavily audited "Deleted Machines" collections.

### 🖥️ Premium User Experience (UX/UI)
- **Glassmorphism & Neon Hues:** A highly immersive, premium Dark Mode aesthetic.
- **Responsive Animations:** Fluid layout transformations backed by skeleton loading and micro-transition feedback.
- **Global Table Search:** Millisecond localized text-filtering against Serial Numbers or Machine Names.
- **Zero-Clutter Forms:** Seamless split structures isolating logic layers for maximal clarity during input sequences.

---

## 🛠️ The Tech Stack

### Frontend Ecosystem
- **React 19 (Vite Build System)** for instantaneous HMR and bundled optimization.
- **React Router DOM** handling protected hierarchies.
- **Context API** driving global abstractions (Auth, Search, Theming, Toast).
- **Lucide React** for dynamic, lightweight iconography.

### Backend Engine
- **Node.js & Express 5** ensuring ultra-fast API mediation.
- **MongoDB Atlas** housing highly-relational Mongoose schemas.
- **JSON Web Token (JWT)** & **Bcrypt** encryption.
- **Nodemailer** for fully integrated SMTP relay services (OTP).

---

## 📋 Standard Installation

1. **Clone the Source Repository:**
   ```bash
   git clone https://github.com/deepanshu0051/AssetFlow.git
   cd AssetFlow
   ```

2. **Initialize Dependencies:**
   ```bash
   # Rapidly hydrates root, frontend, and backend node_modules securely
   npm run install-all
   ```

3. **Secure Your Environment:**
   - Duplicate `.env.example` in both your root and your `frontend/` directory.
   - Inject your `MONGODB_URI`, `EMAIL_PASS`, and generate a robust `JWT_SECRET`.

4. **Launch the Engine:**
   ```bash
   # Connects DB configurations and launches the Vite client simultaneously
   npm run dev
   ```

---

## 📁 Project Topography

```text
AssetFlow/
├── backend/            # Express server context
│   ├── config/         # Deep DB connections & MongoMemoryServer fallbacks
│   ├── controllers/    # Route mediators & payload handling
│   ├── middleware/     # Security checks (JWT, Error handlers)
│   ├── models/         # Relational DB Structs (Admin, Machine, OTP, Notifications)
│   └── routes/         # Network dispatch definitions
├── frontend/           # The User Interface
│   ├── src/
│   │   ├── components/ # Reusable layout parts (DataTables, Skeletons)
│   │   ├── context/    # The global brain
│   │   ├── pages/      # Discrete views 
│   │   └── services/   # Robust Axios interceptor bridges
└── .env.example        # Your foundational mapping sequence
```

---

## 🔮 Roadmap
- [ ] Export localized operational data structures to CSV/Excel functionality.
- [ ] Implement WebSockets for zero-refresh Dashboard telemetry.
- [ ] Advanced Graph.js analytics parsing dynamic GST spending.

---

<p align="center">
  <b>Clean, Secure, and Scalable </b><br/>
  Architected by <a href="https://github.com/deepanshu0051">Deepanshu</a>
</p>
