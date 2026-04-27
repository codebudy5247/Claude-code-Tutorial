import type { Document, Model } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

export interface IUserModel extends Model<IUserDocument> {}

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};