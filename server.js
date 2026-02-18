require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/transfer', require('./routes/transfer'));
app.use('/api/business', require('./routes/business'));

// Serve frontend pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dashboard.html')));
app.get('/cards', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cards.html')));
app.get('/transfer', (req, res) => res.sendFile(path.join(__dirname, 'public', 'transfer.html')));
app.get('/history', (req, res) => res.sendFile(path.join(__dirname, 'public', 'history.html')));
app.get('/business', (req, res) => res.sendFile(path.join(__dirname, 'public', 'business.html')));
app.get('/profile', (req, res) => res.sendFile(path.join(__dirname, 'public', 'profile.html')));

const PORT = process.env.PORT || 3000;
// Auto-process business payouts every 10 minutes
setInterval(async () => {
  try {
    const User = require('./models/User');
    const users = await User.find({ 'businesses.0': { $exists: true } });
    const now = new Date();
    for (const user of users) {
      let changed = false;
      for (const biz of user.businesses) {
        while (biz.nextPayout <= now) {
          user.balance += biz.earnings;
          user.transactions.push({
            type: 'business',
            amount: biz.earnings,
            description: `${biz.name} payout`,
            date: biz.nextPayout
          });
          const ms = biz.earningType === 'daily' ? 3600000
                   : biz.earningType === 'weekly' ? 25200000
                   : 216000000;
          biz.nextPayout = new Date(biz.nextPayout.getTime() + ms);
          changed = true;
        }
      }
      if (changed) await user.save();
    }
  } catch (e) { console.error('Payout error:', e); }
}, 10 * 60 * 1000); // runs every 10 minutes
app.listen(PORT, () => {
  console.log(`🚀 NeoBank running on http://localhost:${PORT}`);
});
