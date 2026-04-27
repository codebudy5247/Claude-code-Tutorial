"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REFRESH_TOKEN_COOKIE_OPTIONS = void 0;
exports.setRefreshTokenCookie = setRefreshTokenCookie;
exports.clearRefreshTokenCookie = clearRefreshTokenCookie;
exports.REFRESH_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};
function setRefreshTokenCookie(res, token) {
    res.cookie('refreshToken', token, exports.REFRESH_TOKEN_COOKIE_OPTIONS);
}
function clearRefreshTokenCookie(res) {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        path: '/auth/refresh',
    });
}
//# sourceMappingURL=cookie.js.map