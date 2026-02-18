const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get current user profile & dashboard data
router.get('/me', auth, async (req, res) => {
  const user = req.user;

  // Process business payouts
  const now = new Date();
  let balanceAdded = 0;

  for (let biz of user.businesses) {
    while (biz.nextPayout <= now) {
      balanceAdded += biz.earnings;
      user.transactions.push({
        type: 'business',
        amount: biz.earnings,
        description: `${biz.name} payout`,
        date: biz.nextPayout
      });

      // Calculate next payout using 1hr=1day logic
      const ms = biz.earningType === 'daily' ? 60 * 60 * 1000
               : biz.earningType === 'weekly' ? 7 * 60 * 60 * 1000
               : 60 * 60 * 60 * 1000; // monthly

      biz.nextPayout = new Date(biz.nextPayout.getTime() + ms);
    }
  }

  if (balanceAdded > 0) {
    user.balance += balanceAdded;
  }

  user.lastSeen = now;
  await user.save();

  res.json({
    fullName: user.fullName,
    email: user.email,
    accountNumber: user.accountNumber,
    cvv: user.cvv,
    expiry: user.expiry,
    balance: user.balance,
    businesses: user.businesses,
    transactions: user.transactions.slice(-100).reverse(),
    totalTransfersSent: user.totalTransfersSent,
    appUsageMinutes: user.appUsageMinutes,
    createdAt: user.createdAt
  });
});

// Track app usage time
router.post('/ping', auth, async (req, res) => {
  const { minutes } = req.body;
  req.user.appUsageMinutes = (req.user.appUsageMinutes || 0) + (minutes || 1);
  await req.user.save();
  res.json({ ok: true });
});

// Look up account holder name (for transfer confirmation)
router.get('/lookup/:accountNumber', auth, async (req, res) => {
  const user = await User.findOne({ accountNumber: req.params.accountNumber });
  if (!user) return res.status(404).json({ error: 'Account not found' });
  if (user._id.toString() === req.user._id.toString())
    return res.status(400).json({ error: 'Cannot transfer to yourself' });
  res.json({ fullName: user.fullName, accountNumber: user.accountNumber });
});

module.exports = router;
