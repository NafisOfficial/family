import mongoose from 'mongoose';

const StorySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    visibility: {
      type: String,
      enum: ['public', 'relatives'],
      default: 'public',
    },
    upvotesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    downvotesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

StorySchema.index({ author: 1 });
StorySchema.index({ visibility: 1 });
StorySchema.index({ createdAt: -1 });
StorySchema.index({ upvotesCount: -1, downvotesCount: -1 });

export default mongoose.models.Story || mongoose.model('Story', StorySchema);
