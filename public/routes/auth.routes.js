"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
const controller = require('../controllers/auth.controllers');
router.post('/signup', controller.signup);
router.post('/login', controller.login);
router.get('/', auth_middleware_1.verifyToken, (req, res) => {
    res.send('Hello World!');
});
exports.default = router;
