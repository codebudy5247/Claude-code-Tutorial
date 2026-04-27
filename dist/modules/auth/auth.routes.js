"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const errorHandler_1 = require("@shared/middlewares/errorHandler");
const router = (0, express_1.Router)();
router.post('/register', (0, errorHandler_1.asyncHandler)(auth_controller_1.AuthController.register));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map