"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kpiController_1 = require("../controllers/kpiController");
const router = (0, express_1.Router)();
router.get('/', kpiController_1.kpiController.getSnapshots);
router.get('/current', kpiController_1.kpiController.getCurrentKpis);
router.post('/capture', kpiController_1.kpiController.captureSnapshot);
exports.default = router;
