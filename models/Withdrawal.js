import mongoose from "mongoose";

const WithdrawalSchema = new mongoose.Schema({
  withdrawalId: {
    type: String,
    unique: true,
    required: false  // Will be set by pre-save hook
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  memberId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['crypto', 'bank', 'paypal']
  },
  withdrawalType: {
    type: String,
    required: true,
    enum: ['spot', 'level']
  },
  walletAddress: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    required: false,
    enum: ['pending', 'processing', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ""
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  },
  transactionHash: {
    type: String,
    default: ""
  },
  fees: {
    type: Number,
    default: 0
  },
  netAmount: {
    type: Number,
    default: 0,
    required: false
  }
}, {
  timestamps: true
});

// Generate unique withdrawal ID and calculate net amount
WithdrawalSchema.pre("save", function (next) {
  // Generate withdrawal ID if not provided
  if (!this.withdrawalId) {
    this.withdrawalId = `WD${Date.now()}${Math.random().toString().substr(2, 4)}`;
  }
  
  // Calculate net amount (amount - fees)
  if (this.amount !== undefined && this.fees !== undefined) {
    this.netAmount = this.amount - this.fees;
  }
  
  next();
});

// Index for better query performance
WithdrawalSchema.index({ userId: 1, createdAt: -1 });
WithdrawalSchema.index({ status: 1 });
// withdrawalId already has unique index from the field definition

export default mongoose.models.Withdrawal || mongoose.model("Withdrawal", WithdrawalSchema);
