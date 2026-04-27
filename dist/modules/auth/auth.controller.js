"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const auth_schema_1 = require("./auth.schema");
const cookie_1 = require("@shared/utils/cookie");
async function register(req, res) {
    const body = auth_schema_1.RegisterSchema.parse(req.body);
    const result = await auth_service_1.AuthService.register(body);
    (0, cookie_1.setRefreshTokenCookie)(res, result.accessToken);
    res.status(201).json({
        user: result.user,
        accessToken: result.accessToken,
    });
}
exports.AuthController = {
    register,
};
//# sourceMappingURL=auth.controller.js.map