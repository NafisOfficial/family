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

const FamilyRelationshipSchema = new mongoose.Schema(
  {
    treeOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fromMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
    },
    toMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FamilyMember',
      required: true,
    },
    relationshipType: {
      type: String,
      enum: RELATIONSHIP_TYPES,
      required: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

FamilyRelationshipSchema.index({ treeOwner: 1, fromMember: 1, toMember: 1 });
FamilyRelationshipSchema.index({ fromMember: 1 });
FamilyRelationshipSchema.index({ toMember: 1 });

export default mongoose.models.FamilyRelationship || mongoose.model('FamilyRelationship', FamilyRelationshipSchema);
