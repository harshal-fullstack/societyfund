"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reserveFundController_1 = require("../controllers/reserveFundController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', reserveFundController_1.getReserveFunds);
router.post('/allocate', auth_1.authenticateToken, auth_1.requireAdmin, reserveFundController_1.updateFundAllocation);
exports.default = router;
