import mongoose from 'mongoose';

const FamilyMemberSchema = new mongoose.Schema(
  {
    treeOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    linkedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    dateOfDeath: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
      default: 'prefer_not_to_say',
    },
    bio: {
      type: String,
      default: '',
      maxlength: 500,
    },
    isAlive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

FamilyMemberSchema.index({ treeOwner: 1 });
FamilyMemberSchema.index({ linkedUser: 1 });

export default mongoose.models.FamilyMember || mongoose.model('FamilyMember', FamilyMemberSchema);
