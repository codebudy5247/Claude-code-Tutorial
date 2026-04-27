"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.errorHandler = exports.AppError = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../utils/logger"));
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    // Handle Mongoose Validation Errors
    if (err instanceof mongoose_1.default.Error.ValidationError) {
        const errors = Object.values(err.errors).map(e => e.message);
        logger_1.default.error('Validation Error', { errors, path: req.path });
        res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors
        });
        return;
    }
    // Handle Mongoose Cast Errors (invalid ObjectId)
    if (err instanceof mongoose_1.default.Error.CastError) {
        logger_1.default.error('Cast Error', { path: err.path, value: err.value });
        res.status(400).json({
            status: 'error',
            message: `Invalid ${err.path}: ${err.value}`
        });
        return;
    }
    // Handle Mongoose Duplicate Key Errors
    if (err.name === 'MongoServerError' && err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        logger_1.default.error('Duplicate Key Error', { field });
        res.status(409).json({
            status: 'error',
            message: `${field} already exists`
        });
        return;
    }
    // Handle Custom AppError
    if (err instanceof AppError) {
        logger_1.default.error(`AppError: ${err.message}`, {
            statusCode: err.statusCode,
            path: req.path,
            method: req.method
        });
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
        return;
    }
    // Handle Unknown Errors
    logger_1.default.error(`Unexpected Error: ${err.message}`, {
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
};
exports.errorHandler = errorHandler;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=errorHandler.js.map