import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import{JWT_SECRET} from "@repo/common-backend/config"
export function authMiddleWare(req:Request,res:Response,next:NextFunction)
{
    const token=req.headers["authorization"] || ""
    const decoded=jwt.verify(token ,JWT_SECRET)
    if(decoded){
        //@ts-ignore
        req.userId=decoded.userId
        console.log(token)
        next();
    }else{
        res.send({
            msg:"invalid token"
        })
        return
    }
}