"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reportHistoryController_1 = require("../controllers/reportHistoryController");
const router = (0, express_1.Router)();
router.get('/history', reportHistoryController_1.reportHistoryController.getHistory);
router.post('/generate', reportHistoryController_1.reportHistoryController.logGeneration);
exports.default = router;
