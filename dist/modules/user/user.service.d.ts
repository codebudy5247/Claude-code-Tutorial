import type { IUserDocument, PublicUser } from './user.types';
declare function createUser(input: {
    name: string;
    email: string;
    passwordHash: string;
}): Promise<IUserDocument>;
declare function findUserByEmail(email: string): Promise<IUserDocument | null>;
declare function toPublicUser(user: IUserDocument): PublicUser;
export declare const UserService: {
    createUser: typeof createUser;
    findUserByEmail: typeof findUserByEmail;
    toPublicUser: typeof toPublicUser;
};
export {};
//# sourceMappingURL=user.service.d.ts.map