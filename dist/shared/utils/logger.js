"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = __importDefault(require("@shared/config/env"));
var LogLevel;
(function (LogLevel) {
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["DEBUG"] = "DEBUG";
})(LogLevel || (LogLevel = {}));
class Logger {
    formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level}] ${message}${metaStr}`;
    }
    info(message, meta) {
        console.log(this.formatMessage(LogLevel.INFO, message, meta));
    }
    warn(message, meta) {
        console.warn(this.formatMessage(LogLevel.WARN, message, meta));
    }
    error(message, meta) {
        console.error(this.formatMessage(LogLevel.ERROR, message, meta));
    }
    debug(message, meta) {
        const logLevel = env_1.default.get().logLevel.toUpperCase();
        if (env_1.default.isDevelopment() || logLevel === 'DEBUG') {
            console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
        }
    }
}
exports.default = new Logger();
//# sourceMappingURL=logger.js.map