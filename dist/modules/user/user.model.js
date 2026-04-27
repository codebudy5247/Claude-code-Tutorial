"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    refreshTokens: {
        type: [String],
        default: [],
    },
}, { timestamps: true, versionKey: false });
UserSchema.set('toJSON', {
    transform: (_doc, ret) => {
        const { passwordHash, refreshTokens, ...rest } = ret;
        return rest;
    },
});
exports.default = mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=user.model.js.map