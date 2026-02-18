# 💎 NeoBank — Virtual Banking System

A full-stack virtual banking application with real-time transfers, business income, and virtual cards.

---

## 📁 Folder Structure

```
neobank/
├── server.js              # Express server entry point
├── package.json           # Node.js dependencies
├── .env                   # Environment variables (configure this!)
├── models/
│   └── User.js            # MongoDB User schema (accounts, transactions, businesses)
├── routes/
│   ├── auth.js            # Sign up / Login routes
│   ├── user.js            # Profile, dashboard data, account lookup
│   ├── transfer.js        # Money transfer between users
│   └── business.js        # Business CRUD
├── middleware/
│   └── auth.js            # JWT authentication middleware
└── public/
    ├── index.html         # Landing page (Login + Sign Up)
    ├── dashboard.html     # Main dashboard
    ├── cards.html         # Virtual card display
    ├── transfer.html      # Send money page
    ├── history.html       # Transaction history
    ├── business.html      # Business management
    ├── profile.html       # Profile + app usage stats
    ├── css/
    │   └── style.css      # Global dark theme styles
    └── js/
        ├── app.js         # Shared utilities (API, auth, helpers)
        └── sidebar.js     # Sidebar nav template
```

---

## ⚡ Quick Start (Local)

### Prerequisites
- [Node.js v18+](https://nodejs.org)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) OR a free [MongoDB Atlas](https://cloud.mongodb.com) account

### 1. Install dependencies
```bash
cd neobank
npm install
```

### 2. Configure environment
Edit `.env`:
```env
# For LOCAL MongoDB:
MONGODB_URI=mongodb://localhost:27017/neobank

# For MongoDB Atlas (cloud):
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/neobank

JWT_SECRET=change_this_to_a_long_random_string_for_security
PORT=3000
```

### 3. Start MongoDB (if running locally)
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Windows
net start MongoDB

# Linux
sudo systemctl start mongod
```

### 4. Start the app
```bash
npm start
# or for development with auto-restart:
npm run dev
```

### 5. Open in Chrome
```
http://localhost:3000
```

---

## 🌐 How to Deploy Online

### Option A: Render.com (Free Tier)

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment Variables:** Add `MONGODB_URI`, `JWT_SECRET`, `PORT=10000`
5. Use **MongoDB Atlas** (free) for the database
6. Deploy!

### Option B: Railway.app

1. Go to [railway.app](https://railway.app) → New Project
2. Deploy from GitHub
3. Add a MongoDB plugin OR use Atlas
4. Set environment variables in the dashboard

### Option C: VPS (DigitalOcean/Linode)

```bash
# Install Node & PM2
npm install -g pm2
pm2 start server.js --name neobank
pm2 save
```

---

## 🔗 How User Transfers Work

```
User A (account: 1234567890) → sends $100 → User B (account: 9876543210)

1. User A enters B's 10-digit account number
2. System looks up B in MongoDB: User.findOne({ accountNumber: '9876543210' })
3. User A enters their PIN (verified against hashed PIN in DB)
4. Atomic update:
   - A.balance -= 100
   - A.transactions.push({ type: 'sent', amount: 100, to: B.name })
   - B.balance += 100
   - B.transactions.push({ type: 'received', amount: 100, from: A.name })
5. Both records saved to MongoDB
```

**Account numbers are unique 10-digit IDs** — they are the primary identifier for transfers.

---

## 🏢 Business Payout System

The app uses a compressed time system:
| Real Time | Virtual Time |
|-----------|-------------|
| 1 hour    | 1 day       |
| 7 hours   | 1 week      |
| 60 hours  | 1 month     |

When a user loads their dashboard or profile, the server checks if any businesses have passed their `nextPayout` time and automatically credits the balance.

---

## 🔒 Security

- **Passwords:** Hashed with `bcrypt` (12 rounds)
- **PINs:** Hashed with `bcrypt` (10 rounds)
- **Sessions:** JWT tokens (7-day expiry)
- **Validation:** Server-side on all inputs
- **Account Numbers:** Guaranteed unique via collision-checked generation

---

## 🗄️ Database

Uses **MongoDB** with Mongoose ODM. One `users` collection stores everything:
- Profile info
- Hashed password & PIN
- Account number, CVV, expiry
- Balance
- Embedded business array
- Embedded transaction history array

For production, use **MongoDB Atlas** (free 512MB tier works well).

---

## 🎨 Features Summary

| Feature | Status |
|---------|--------|
| Sign Up / Login | ✅ |
| Unique 10-digit account numbers | ✅ |
| CVV + Expiry date generation | ✅ |
| Dashboard with stats | ✅ |
| Virtual debit card UI (flippable!) | ✅ |
| Business income system | ✅ |
| Business countdown timers | ✅ |
| Real-time transfers between users | ✅ |
| PIN confirmation for transfers | ✅ |
| Transaction history | ✅ |
| App usage timer | ✅ |
| Dark theme modern UI | ✅ |
| Password & PIN hashing | ✅ |
