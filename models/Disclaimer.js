import mongoose from 'mongoose';

const DisclaimerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: '⚠️ Important Disclaimer'
  },
  sections: [{
    heading: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: false,
      default: ''
    }
  }],
  updatedBy: {
    type: String,
    required: false
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.models.Disclaimer || mongoose.model('Disclaimer', DisclaimerSchema);
