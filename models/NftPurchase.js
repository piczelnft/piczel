import mongoose from "mongoose";

const NftPurchaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    memberId: {
      type: String,
      required: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      index: true,
    },
    series: {
      type: String,
      required: true,
      index: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    payoutStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
      index: true,
    },
    paidOutAt: {
      type: Date,
      default: null,
    },
    paidOutAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user cannot buy the same NFT code twice
NftPurchaseSchema.index({ userId: 1, code: 1 }, { unique: true });

export default mongoose.models.NftPurchase || mongoose.model("NftPurchase", NftPurchaseSchema);


