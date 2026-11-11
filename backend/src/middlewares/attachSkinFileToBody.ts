import { NextFunction, Request, Response } from "express";

export const attachSkinFileToBody = (req: Request, _res: Response, next: NextFunction) => {
    req.body = { ...req.body };

    if (req.file) {
        req.body.skinFile = new File([new Uint8Array(req.file.buffer)], req.file.originalname, {
            type: req.file.mimetype,
        });
    }

    next();
};