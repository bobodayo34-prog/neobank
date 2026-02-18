const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

function generateCVV() {
  return Math.floor(100 + Math.random() * 900).toString();
}

function generateExpiry() {
  const now = new Date();
  const year = now.getFullYear() + Math.floor(2 + Math.random() * 4);
  const month = String(Math.floor(1 + Math.random() * 12)).padStart(2, '0');
  return `${month}/${year.toString().slice(-2)}`;
}

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ['income', 'sent', 'received', 'business'], required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  counterparty: { type: String }, // name or account number
  counterpartyAccount: { type: String },
  date: { type: Date, default: Date.now }
});

const businessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  earnings: { type: Number, required: true },
  earningType: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  nextPayout: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  pin: { type: String, required: true },
  accountNumber: { type: String, unique: true },
  cvv: { type: String },
  expiry: { type: String },
  balance: { type: Number, default: 0 },
  businesses: [businessSchema],
  transactions: [transactionSchema],
  totalTransfersSent: { type: Number, default: 0 },
  appUsageMinutes: { type: Number, default: 0 },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save: hash password, pin, generate account number
userSchema.pre('save', async function(next) {
  if (this.isNew) {
    // Generate unique account number
    let accountNumber;
    let exists = true;
    while (exists) {
      accountNumber = generateAccountNumber();
      const found = await mongoose.model('User').findOne({ accountNumber });
      if (!found) exists = false;
    }
    this.accountNumber = accountNumber;
    this.cvv = generateCVV();
    this.expiry = generateExpiry();
  }

  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  if (this.isModified('pin')) {
    this.pin = await bcrypt.hash(this.pin, 10);
  }
  next();
});

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.comparePin = function(pin) {
  return bcrypt.compare(pin, this.pin);
};

module.exports = mongoose.model('User', userSchema);
