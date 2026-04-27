"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
const auth_service_1 = require("@modules/auth/auth.service");
const errorHandler_1 = require("./errorHandler");
function requireAuth(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
    const token = authHeader.slice(7);
    try {
        const payload = auth_service_1.AuthService.verifyAccessToken(token);
        req.user = { _id: payload.sub };
        next();
    }
    catch {
        throw new errorHandler_1.AppError('Unauthorized', 401);
    }
}
function optionalAuth(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return next();
    }
    const token = authHeader.slice(7);
    try {
        const payload = auth_service_1.AuthService.verifyAccessToken(token);
        req.user = { _id: payload.sub };
    }
    catch {
        // Invalid token, but optional - continue without user
    }
    next();
}
//# sourceMappingURL=auth.middleware.js.map