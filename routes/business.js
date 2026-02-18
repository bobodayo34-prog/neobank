const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Add a business
router.post('/add', auth, async (req, res) => {
  try {
    const { name, type, earnings, earningType } = req.body;
    const user = req.user;

    if (user.businesses.length >= 10)
      return res.status(400).json({ error: 'Maximum 10 businesses allowed' });

    if (!name || !type || !earnings || !earningType)
      return res.status(400).json({ error: 'All fields required' });

    const amt = parseFloat(earnings);
    if (isNaN(amt) || amt <= 0)
      return res.status(400).json({ error: 'Invalid earnings amount' });

    // Calculate first payout time (1hr=1day, 7hr=1week, 60hr=1month)
    const now = new Date();
    const ms = earningType === 'daily' ? 60 * 60 * 1000
             : earningType === 'weekly' ? 7 * 60 * 60 * 1000
             : 60 * 60 * 60 * 1000;

    user.businesses.push({
      name,
      type,
      earnings: amt,
      earningType,
      nextPayout: new Date(now.getTime() + ms)
    });

    await user.save();
    res.json({ message: 'Business added!', businesses: user.businesses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a business
router.delete('/:bizId', auth, async (req, res) => {
  const user = req.user;
  user.businesses = user.businesses.filter(b => b._id.toString() !== req.params.bizId);
  await user.save();
  res.json({ message: 'Business removed' });
});

module.exports = router;
