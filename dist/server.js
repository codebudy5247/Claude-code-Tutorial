"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("@shared/config/database"));
const logger_1 = __importDefault(require("@shared/utils/logger"));
const env_1 = __importDefault(require("@shared/config/env"));
const { port, appName, nodeEnv } = env_1.default.get();
async function startServer() {
    try {
        await database_1.default.connect();
        app_1.default.listen(port, () => {
            logger_1.default.info(`${appName} is running`, { port, environment: nodeEnv });
            logger_1.default.info(`Health check: http://localhost:${port}/health`);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server', error);
        process.exit(1);
    }
}
process.on('SIGINT', async () => {
    logger_1.default.info('SIGINT received, shutting down gracefully...');
    await database_1.default.disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    logger_1.default.info('SIGTERM received, shutting down gracefully...');
    await database_1.default.disconnect();
    process.exit(0);
});
startServer();
//# sourceMappingURL=server.js.map