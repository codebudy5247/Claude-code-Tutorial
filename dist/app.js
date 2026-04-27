"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const errorHandler_1 = require("@shared/middlewares/errorHandler");
const logger_1 = __importDefault(require("@shared/utils/logger"));
const env_1 = __importDefault(require("@shared/config/env"));
const auth_1 = require("@modules/auth");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    logger_1.default.info(`${req.method} ${req.path}`, {
        body: req.body,
        query: req.query
    });
    next();
});
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        app: env_1.default.get().appName,
        environment: env_1.default.get().nodeEnv,
        timestamp: new Date().toISOString()
    });
});
app.use('/auth', auth_1.authRouter);
app.use((_req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found'
    });
});
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map