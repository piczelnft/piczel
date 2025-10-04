import mongoose from "mongoose";

const SupportTicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  userName: {
    type: String,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  memberId: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: [true, "Subject is required"],
    maxlength: [200, "Subject cannot be more than 200 characters"],
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Description is required"],
    maxlength: [2000, "Description cannot be more than 2000 characters"],
    trim: true,
  },
  category: {
    type: String,
    enum: ["General", "Technical", "Account", "Payment", "Bug Report", "Feature Request"],
    default: "General",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  status: {
    type: String,
    enum: ["open", "in_progress", "resolved", "closed", "pending"],
    default: "open",
    index: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  assignedToName: {
    type: String,
    default: null,
  },
  lastResponse: {
    type: Date,
    default: null,
  },
  responses: [{
    message: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
SupportTicketSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Generate unique ticket ID
SupportTicketSchema.pre("save", function (next) {
  if (!this.ticketId) {
    // Generate a simple unique ticket ID
    this.ticketId = `TK${Date.now()}${Math.random().toString().substr(2, 4)}`;
  }
  next();
});

export default mongoose.models.SupportTicket || mongoose.model("SupportTicket", SupportTicketSchema);
