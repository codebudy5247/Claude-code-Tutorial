export type TokenPayload = {
    sub: string;
    iat: number;
    exp: number;
};
export type TokenPair = {
    accessToken: string;
    refreshToken: string;
};
export type AuthResult = {
    user: {
        id: string;
        name: string;
        email: string;
    };
    accessToken: string;
};
export type RegisterInput = {
    name: string;
    email: string;
    password: string;
};
//# sourceMappingURL=auth.types.d.ts.map