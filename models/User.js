import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  // Unique public identifier a user can share for sponsorship validation
  memberId: {
    type: String,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxlength: [60, "Name cannot be more than 60 characters"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email",
    ],
  },
  mobile: {
    type: String,
    required: [true, "Please provide a mobile number"],
    unique: true,
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      "Please provide a valid mobile number",
    ],
  },
  note: {
    type: String,
    default: "",
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [6, "Password must be at least 6 characters"],
    select: false, // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  // Direct MLM sponsorship - sponsor is the direct parent
  sponsor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
    index: true,
  },
  // Activation happens at signup now
  isActivated: {
    type: Boolean,
    default: false,
    index: true,
  },
  activatedAt: {
    type: Date,
    default: null,
  },
  package: {
    type: String,
    default: "",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  wallet: {
    balance: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      default: "",
    },
  },
  // MetaMask wallet integration
  metamaskWallet: {
    address: {
      type: String,
      default: "",
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    connectedAt: {
      type: Date,
      default: null,
    },
    network: {
      type: String,
      default: "",
    },
  },
  // Financial tracking fields
  walletBalance: {
    type: Number,
    default: 0,
  },
  fundBalance: {
    type: Number,
    default: 0,
  },
  totalDeposit: {
    type: Number,
    default: 0,
  },
  totalWithdrawal: {
    type: Number,
    default: 0,
  },
  // Income tracking
  sponsorIncome: {
    type: Number,
    default: 0,
  },
  levelIncome: {
    type: Number,
    default: 0,
  },
  roiIncome: {
    type: Number,
    default: 0,
  },
  committeeIncome: {
    type: Number,
    default: 0,
  },
  rewardIncome: {
    type: Number,
    default: 0,
  },
  // Member volume tracking
  sponsoredMembersVolume: {
    type: Number,
    default: 0,
  },
  directMembersVolume: {
    type: Number,
    default: 0,
  },
  totalMembersVolume: {
    type: Number,
    default: 0,
  },
  // User status
  isBlocked: {
    type: Boolean,
    default: false,
  },
  profile: {
    avatar: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Helper to generate a unique memberId (e.g., M + base36 timestamp + random)
async function generateUniqueMemberId(model) {
  let attempt = 0;
  while (attempt < 5) {
    const candidate = `M${Date.now().toString(36)}${Math.random()
      .toString(36)
      .slice(2, 6)}`.toUpperCase();
    const exists = await model.exists({ memberId: candidate });
    if (!exists) return candidate;
    attempt += 1;
  }
  // Fallback to a more random long id if collisions persist
  return `M${Math.random().toString(36).slice(2, 12).toUpperCase()}`;
}

// Hash password before saving
UserSchema.pre("save", async function (next) {
  // Auto-generate memberId on first save if missing
  if (!this.memberId) {
    try {
      this.memberId = await generateUniqueMemberId(this.constructor);
    } catch (err) {
      return next(err);
    }
  }

  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the updatedAt field before saving
UserSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Transform output to remove sensitive data
UserSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
