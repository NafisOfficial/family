import mongoose from 'mongoose';

const RELATIONSHIP_TYPES = [
  'father',
  'mother',
  'son',
  'daughter',
  'spouse',
  'brother',
  'sister',
  'grandfather',
  'grandmother',
  'grandson',
  'granddaughter',
  'uncle',
  'aunt',
  'nephew',
  'niece',
  'cousin',
];

const ConnectionRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    relationshipType: {
      type: String,
      enum: RELATIONSHIP_TYPES,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

ConnectionRequestSchema.index({ sender: 1, receiver: 1 });
ConnectionRequestSchema.index({ receiver: 1, status: 1 });
ConnectionRequestSchema.index({ sender: 1, status: 1 });

export default mongoose.models.ConnectionRequest || mongoose.model('ConnectionRequest', ConnectionRequestSchema);
