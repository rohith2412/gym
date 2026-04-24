import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    // This should match your auth provider (Auth0 sub, Firebase uid, etc)
  },

  // Subscription status
  status: {
    type: String,
    enum: ["active", "canceled", "expired", "trial"],
    default: "trial",
    index: true,
  },

  plan: {
    type: String,
    enum: ["premium"],
    default: "premium",
  },

  price: {
    type: Number, // in cents, e.g., 1200 for $12
    default: 1200,
  },

  billingCycle: {
    type: String,
    enum: ["monthly", "annual"],
    default: "monthly",
  },

  // Dates
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },

  startDate: {
    type: Date,
    required: true,
  },

  endDate: {
    type: Date, // When subscription expires/renews
  },

  trialEndsAt: {
    type: Date, // 7 days from startDate for trial
  },

  canceledAt: {
    type: Date,
  },

  // Payment method
  paymentMethod: {
    type: String,
    enum: ["iap", "stripe"],
    required: true,
  },

  // Transaction tracking
  transactionId: {
    type: String,
    // App Store: com.apple.receipt.original_transaction_id
    // Stripe: ch_xxxxx
  },

  originalTransactionId: {
    type: String,
    index: true,
    // For App Store subscription tracking across renewals
  },

  receiptData: {
    type: String,
    // Base64 encoded App Store receipt
    // Keep encrypted in production
  },

  bundleId: {
    type: String,
    // e.g., com.pocketgym.app
  },

  productId: {
    type: String,
    // e.g., com.pocketgym.premium.monthly
  },

  // IAP specific
  isTrialUsed: {
    type: Boolean,
    default: false,
  },

  renewalRetryCount: {
    type: Number,
    default: 0,
  },

  lastRenewalAttempt: {
    type: Date,
  },

  // Metadata
  notes: String,
  autoRenew: {
    type: Boolean,
    default: true,
  },
});

// Indexes for queries
subscriptionSchema.index({ userId: 1, status: 1 });
subscriptionSchema.index({ transactionId: 1 });
subscriptionSchema.index({ endDate: 1 });
subscriptionSchema.index({ createdAt: -1 });

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", subscriptionSchema);
