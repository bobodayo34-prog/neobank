const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

router.post('/send', auth, async (req, res) => {
  try {
    const { toAccountNumber, amount, pin } = req.body;
    const sender = req.user;

    // Validate PIN
    const pinValid = await sender.comparePin(pin);
    if (!pinValid) return res.status(400).json({ error: 'Invalid PIN' });

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0)
      return res.status(400).json({ error: 'Invalid amount' });

    if (sender.balance < amt)
      return res.status(400).json({ error: 'Insufficient balance' });

    if (sender.accountNumber === toAccountNumber)
      return res.status(400).json({ error: 'Cannot transfer to yourself' });

    const receiver = await User.findOne({ accountNumber: toAccountNumber });
    if (!receiver) return res.status(404).json({ error: 'Recipient account not found' });

    const now = new Date();

    // Deduct from sender
    sender.balance -= amt;
    sender.totalTransfersSent += 1;
    sender.transactions.push({
      type: 'sent',
      amount: amt,
      description: `Transfer to ${receiver.fullName}`,
      counterparty: receiver.fullName,
      counterpartyAccount: toAccountNumber,
      date: now
    });
    await sender.save();

    // Add to receiver
    receiver.balance += amt;
    receiver.transactions.push({
      type: 'received',
      amount: amt,
      description: `Transfer from ${sender.fullName}`,
      counterparty: sender.fullName,
      counterpartyAccount: sender.accountNumber,
      date: now
    });
    await receiver.save();

    res.json({
      message: `Successfully sent $${amt.toFixed(2)} to ${receiver.fullName}`,
      newBalance: sender.balance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Transfer failed' });
  }
});

module.exports = router;

// Shop purchase
router.post('/purchase', auth, async (req, res) => {
  try {
    const { amount, pin, description, itemId, isSell, isCrypto } = req.body;
    const user = req.user;

    // Sell = credit the account (no PIN needed)
    if (isSell) {
      const sellAmt = Math.abs(parseFloat(amount));
      if (isNaN(sellAmt) || sellAmt <= 0) return res.status(400).json({ error: 'Invalid amount' });
      user.balance += sellAmt;
      user.transactions.push({
        type: 'received',
        amount: sellAmt,
        description: description || 'Item sold',
        counterparty: 'NeoBank Shop',
        date: new Date()
      });
      await user.save();
      return res.json({ message: 'Item sold!', newBalance: user.balance });
    }

    // Crypto buy — no PIN, just deduct
    if (isCrypto) {
      const amt = parseFloat(amount);
      if (isNaN(amt) || amt <= 0) return res.status(400).json({ error: 'Invalid amount' });
      if (user.balance < amt) return res.status(400).json({ error: 'Insufficient balance' });
      user.balance -= amt;
      user.transactions.push({
        type: 'sent',
        amount: amt,
        description: description || 'Crypto purchase',
        counterparty: 'NeoBank Crypto',
        date: new Date()
      });
      await user.save();
      return res.json({ message: 'Crypto bought!', newBalance: user.balance });
    }

    // Normal purchase — verify PIN
    const pinValid = await user.comparePin(pin);
    if (!pinValid) return res.status(400).json({ error: 'Invalid PIN' });

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return res.status(400).json({ error: 'Invalid amount' });
    if (user.balance < amt) return res.status(400).json({ error: 'Insufficient balance' });

    user.balance -= amt;
    user.transactions.push({
      type: 'sent',
      amount: amt,
      description: description || 'Shop purchase',
      counterparty: 'NeoBank Shop',
      date: new Date()
    });
    await user.save();

    res.json({ message: 'Purchase successful!', newBalance: user.balance });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Purchase failed' });
  }
});
