import { Request, Response } from 'express';
import {LinkModel} from '../models/link.models';
import {User} from '../models/user.models';
import {random} from '../utils/makeid';
import { content } from '../models/content.models';


export const shareLink = async (req: Request, res: Response) => {
    const share = req.body.share;
    try {
       if (share) {
        const existingLink = await LinkModel.findOne({
            userId: req.userId
        });

        if (existingLink) {
            res.json({
                hash: existingLink.hash
            })
            return;
        }
        const hash = random(10);

        await LinkModel.create({
            hash: hash,
            userId: req.userId
        });

        res.json({
            hash
        })
    }
        else {

        await LinkModel.deleteOne({userId: req.userId})

        res.json({
            message: "Removed link"
        })

       }
        
    } catch (error:any) {
        res.status(500).json({message: error.message});
    }
}

export const getSharedContent = async (req: Request, res: Response) => {
    const hash = req.params.shareLink;

    const link = await LinkModel.findOne({hash})

    if(!link){
        return res.status(404).json({message: "Link not found"})
    }

    const contentData = await content.find({userId: link.userId})

    const user = await User.findOne({_id: link.userId})

    if(!user){
        return res.status(404).json({message: "User not found"})
    }

    res.status(200).json({
        username: user.name,
        content: contentData
    })
}