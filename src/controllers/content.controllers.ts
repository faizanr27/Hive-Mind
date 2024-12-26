import { content } from "../models/content.models";
import { Request, Response } from "express";

exports.createContent = async (req: Request, res:Response) => {
    const link = req.body.link;
    const type = req.body.type;
    await content.create({
        link,
        type,
        title: req.body.title,
        userId: req.userId,
        tags: []
    })

    res.json({
        message: "Content added"
    })
    
}


exports.getContent = async (req: Request, res:Response) => {

    const userId = req.userId;
    const userContent = await content.find({
        userId: userId
    }).populate("userId", "username")
    res.json({
        userContent
    })
}

exports.deleteContent = async (req: Request, res:Response) => {
    const contentId = req.body.contentId;

    await content.deleteMany({
        contentId,
        userId: req.userId
    })

    res.json({
        message: "Deleted"
    })
}