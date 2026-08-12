import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    harmfulLabel: {
      type: String,
      default: null,
    },
    harmfulConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CommentSchema.index({ story: 1 });
CommentSchema.index({ author: 1 });

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
