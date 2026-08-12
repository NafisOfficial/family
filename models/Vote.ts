import mongoose from 'mongoose';

const VoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },
    type: {
      type: String,
      enum: ['up', 'down'],
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

VoteSchema.index({ user: 1, story: 1 }, { unique: true });
VoteSchema.index({ story: 1 });

export default mongoose.models.Vote || mongoose.model('Vote', VoteSchema);
