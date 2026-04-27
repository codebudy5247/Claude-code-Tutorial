"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = __importDefault(require("./user.model"));
async function createUser(input) {
    const user = new user_model_1.default({
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
    });
    return user.save();
}
async function findUserByEmail(email) {
    return user_model_1.default.findOne({ email: email.toLowerCase() }).lean();
}
function toPublicUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
    };
}
exports.UserService = {
    createUser,
    findUserByEmail,
    toPublicUser,
};
//# sourceMappingURL=user.service.js.map