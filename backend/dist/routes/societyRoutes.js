"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const societyController_1 = require("../controllers/societyController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, societyController_1.getSocietyInfo);
router.patch('/', auth_1.authenticateToken, auth_1.requireAdmin, societyController_1.updateSocietyInfo);
exports.default = router;
