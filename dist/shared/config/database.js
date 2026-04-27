"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("@shared/utils/logger"));
const env_1 = __importDefault(require("@shared/config/env"));
class Database {
    async connect(uri) {
        const connectionUri = uri || env_1.default.get().mongoUri;
        try {
            await mongoose_1.default.connect(connectionUri);
            logger_1.default.info('Successfully connected to MongoDB with Mongoose', {
                uri: connectionUri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') // Hide password in logs
            });
            // Connection event handlers
            mongoose_1.default.connection.on('error', (error) => {
                logger_1.default.error('MongoDB connection error', error);
            });
            mongoose_1.default.connection.on('disconnected', () => {
                logger_1.default.warn('MongoDB disconnected');
            });
        }
        catch (error) {
            logger_1.default.error('Failed to connect to MongoDB', error);
            throw error;
        }
    }
    async disconnect() {
        await mongoose_1.default.disconnect();
        logger_1.default.info('Disconnected from MongoDB');
    }
    // For testing - clear all collections
    async clearDatabase() {
        const collections = mongoose_1.default.connection.collections;
        for (const key in collections) {
            await collections[key].deleteMany({});
        }
    }
}
exports.default = new Database();
//# sourceMappingURL=database.js.map