"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const user_service_1 = require("@modules/user/user.service");
const errorHandler_1 = require("@shared/middlewares/errorHandler");
const env_1 = __importDefault(require("@shared/config/env"));
const SALT_ROUNDS = 12;
function hashPassword(plain) {
    return bcrypt_1.default.hash(plain, SALT_ROUNDS);
}
function hashToken(token) {
    return node_crypto_1.default.createHash('sha256').update(token).digest('hex');
}
function generateTokens(userId) {
    const config = env_1.default.get();
    const accessToken = jsonwebtoken_1.default.sign({ sub: userId }, config.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ sub: userId }, config.refreshSecret, { expiresIn: '7d' });
    return { accessToken, refreshToken };
}
function verifyAccessToken(token) {
    const config = env_1.default.get();
    return jsonwebtoken_1.default.verify(token, config.jwtSecret);
}
async function register(input) {
    const config = env_1.default.get();
    const existingUser = await user_service_1.UserService.findUserByEmail(input.email);
    if (existingUser) {
        throw new errorHandler_1.AppError('Email already registered', 409);
    }
    const passwordHash = await hashPassword(input.password);
    const user = await user_service_1.UserService.createUser({
        name: input.name,
        email: input.email,
        passwordHash,
    });
    const tokens = generateTokens(user._id.toString());
    return {
        user: user_service_1.UserService.toPublicUser(user),
        accessToken: tokens.accessToken,
    };
}
exports.AuthService = {
    register,
    generateTokens,
    verifyAccessToken,
    hashPassword,
};
//# sourceMappingURL=auth.service.js.map