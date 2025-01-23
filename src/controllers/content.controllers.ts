import { content } from "../models/content.models";
import { Request, Response } from "express";

exports.createContent = async (req: Request, res:Response) => {
    const link = req.body.link;
    const type = req.body.type;
    await content.create({
        link,
        type,
        title: req.body.title,
        userId: res.locals.jwtData,
        tags: []
    })

    res.json({
        message: "Content added"
    })

}


exports.getContent = async (req: Request, res:Response) => {

    try {
        const userContent = await content.find({ userId: res.locals.jwtData }).populate("userId", "name");

        res.status(200).json({
          success: true,
          userContent,
        });
      } catch (error: any) {
        console.error(`Error fetching content: ${error.message}`);
        res.status(500).json({
          success: false,
          message: "Failed to fetch content.",
          error: error.message,
        });
      }
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