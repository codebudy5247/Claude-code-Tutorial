import User from './user.model';
import type { IUserDocument, PublicUser } from './user.types';

async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;
}): Promise<IUserDocument> {
  const user = new User({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
  });
  return user.save();
}

async function findUserByEmail(email: string): Promise<IUserDocument | null> {
  return User.findOne({ email: email.toLowerCase() }).lean();
}

function toPublicUser(user: IUserDocument): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export const UserService = {
  createUser,
  findUserByEmail,
  toPublicUser,
};