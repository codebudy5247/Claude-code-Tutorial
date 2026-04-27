"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
dotenv_1.default.config({ path: (0, path_1.resolve)(__dirname, "../../../.env") });
class Config {
    constructor() {
        this.config = {
            port: this.getNumber("PORT", 3000),
            nodeEnv: this.getString("NODE_ENV", "development"),
            mongoUri: this.getString("MONGO_URI", "mongodb://localhost:27017/test_db"),
            logLevel: this.getString("LOG_LEVEL", "info"),
            appName: this.getString("APP_NAME", "API"),
            jwtSecret: this.getString("JWT_SECRET", ""),
            jwtExpiresIn: this.getString("JWT_EXPIRES_IN", "15m"),
            refreshSecret: this.getString("REFRESH_SECRET", ""),
            refreshExpiresIn: this.getString("REFRESH_EXPIRES_IN", "7d"),
        };
        this.validate();
    }
    getString(key, defaultValue) {
        return process.env[key] || defaultValue;
    }
    getNumber(key, defaultValue) {
        const value = process.env[key];
        if (!value)
            return defaultValue;
        const parsed = parseInt(value, 10);
        if (isNaN(parsed)) {
            throw new Error(`Environment variable ${key} must be a number`);
        }
        return parsed;
    }
    validate() {
        if (!this.config.mongoUri) {
            throw new Error("MONGO_URI is required");
        }
        if (!this.config.jwtSecret) {
            throw new Error("JWT_SECRET is required");
        }
        if (!this.config.refreshSecret) {
            throw new Error("REFRESH_SECRET is required");
        }
        if (this.config.port < 1 || this.config.port > 65535) {
            throw new Error("PORT must be between 1 and 65535");
        }
        const validEnvs = ["development", "production", "test"];
        if (!validEnvs.includes(this.config.nodeEnv)) {
            console.warn(`Warning: NODE_ENV should be one of: ${validEnvs.join(", ")}`);
        }
    }
    get() {
        return { ...this.config };
    }
    isDevelopment() {
        return this.config.nodeEnv === "development";
    }
    isProduction() {
        return this.config.nodeEnv === "production";
    }
    isTest() {
        return this.config.nodeEnv === "test";
    }
}
exports.default = new Config();
//# sourceMappingURL=env.js.map