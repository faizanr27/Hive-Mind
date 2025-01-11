"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.content = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const contentSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    link: String,
    tags: [{ type: mongoose_1.default.Types.ObjectId, ref: 'Tag' }],
    type: String,
    userId: { type: mongoose_1.default.Types.ObjectId, ref: 'User', required: true },
});
exports.content = mongoose_1.default.model('Content', contentSchema);
