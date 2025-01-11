"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const content_models_1 = require("../models/content.models");
exports.createContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const link = req.body.link;
    const type = req.body.type;
    yield content_models_1.content.create({
        link,
        type,
        title: req.body.title,
        userId: req.userId,
        tags: []
    });
    res.json({
        message: "Content added"
    });
});
exports.getContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const userContent = yield content_models_1.content.find({
        userId: userId
    }).populate("userId", "username");
    res.json({
        userContent
    });
});
exports.deleteContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.body.contentId;
    yield content_models_1.content.deleteMany({
        contentId,
        userId: req.userId
    });
    res.json({
        message: "Deleted"
    });
});
