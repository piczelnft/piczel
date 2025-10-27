import mongoose from 'mongoose';

const DailyCommissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  memberId: {
    type: String,
    required: true
  },
  sponsorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sponsorMemberId: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  nftPurchaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NftPurchase',
    required: true
  },
  totalCommission: {
    type: Number,
    required: true
  },
  dailyAmount: {
    type: Number,
    required: true
  },
  totalDays: {
    type: Number,
    default: 365
  },
  daysPaid: {
    type: Number,
    default: 0
  },
  daysRemaining: {
    type: Number,
    required: true
  },
  totalPaid: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  lastPaymentDate: {
    type: Date
  },
  nextPaymentDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
DailyCommissionSchema.index({ userId: 1, status: 1 });
DailyCommissionSchema.index({ sponsorId: 1, status: 1 });
DailyCommissionSchema.index({ nextPaymentDate: 1, status: 1 });

const DailyCommission = mongoose.models.DailyCommission || mongoose.model('DailyCommission', DailyCommissionSchema);

export default DailyCommission;
