"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
const controller = require('../controllers/content.controllers');
router.get('/Content', auth_middleware_1.verifyToken, controller.getContent);
router.post('/Content', auth_middleware_1.verifyToken, controller.createContent);
router.delete('/Content', auth_middleware_1.verifyToken, controller.deleteContent);
exports.default = router;
