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
exports.getSharedContent = exports.shareLink = void 0;
const link_models_1 = require("../models/link.models");
const user_models_1 = require("../models/user.models");
const makeid_1 = require("../utils/makeid");
const content_models_1 = require("../models/content.models");
const shareLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    try {
        if (share) {
            const existingLink = yield link_models_1.LinkModel.findOne({
                userId: req.userId
            });
            if (existingLink) {
                res.json({
                    hash: existingLink.hash
                });
                return;
            }
            const hash = (0, makeid_1.random)(10);
            yield link_models_1.LinkModel.create({
                hash: hash,
                userId: req.userId
            });
            res.json({
                hash
            });
        }
        else {
            yield link_models_1.LinkModel.deleteOne({ userId: req.userId });
            res.json({
                message: "Removed link"
            });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.shareLink = shareLink;
const getSharedContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield link_models_1.LinkModel.findOne({ hash });
    if (!link) {
        return res.status(404).json({ message: "Link not found" });
    }
    const contentData = yield content_models_1.content.find({ userId: link.userId });
    const user = yield user_models_1.User.findOne({ _id: link.userId });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
        username: user.name,
        content: contentData
    });
});
exports.getSharedContent = getSharedContent;
