import type { Response } from 'express';
export declare const REFRESH_TOKEN_COOKIE_OPTIONS: {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict";
    path: string;
    maxAge: number;
};
export declare function setRefreshTokenCookie(res: Response, token: string): void;
export declare function clearRefreshTokenCookie(res: Response): void;
//# sourceMappingURL=cookie.d.ts.map