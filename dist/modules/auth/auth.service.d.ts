import type { TokenPair, TokenPayload, RegisterInput, AuthResult } from './auth.types';
declare function hashPassword(plain: string): Promise<string>;
declare function generateTokens(userId: string): TokenPair;
declare function verifyAccessToken(token: string): TokenPayload;
declare function register(input: RegisterInput): Promise<AuthResult>;
export declare const AuthService: {
    register: typeof register;
    generateTokens: typeof generateTokens;
    verifyAccessToken: typeof verifyAccessToken;
    hashPassword: typeof hashPassword;
};
export {};
//# sourceMappingURL=auth.service.d.ts.map