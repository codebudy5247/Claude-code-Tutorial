import mongoose from 'mongoose';
import type { IUserDocument, IUserModel } from './user.types';

const UserSchema = new mongoose.Schema<IUserDocument, IUserModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const { passwordHash, refreshTokens, ...rest } = ret;
    return rest;
  },
});

export default mongoose.model<IUserDocument, IUserModel>('User', UserSchema);