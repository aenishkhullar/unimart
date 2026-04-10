import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['user', 'product'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      // Ref can be dynamic but we don't strictly need a mongoose ref field here, 
      // just storing the ObjectId is fine, or we can use refPath if needed.
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved'],
      default: 'pending',
    }
  },
  { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);

export default Report;
