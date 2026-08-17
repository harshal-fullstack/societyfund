"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exportHistoryController_1 = require("../controllers/exportHistoryController");
const router = (0, express_1.Router)();
router.get('/history', exportHistoryController_1.exportHistoryController.getHistory);
router.post('/', exportHistoryController_1.exportHistoryController.logExport);
exports.default = router;
