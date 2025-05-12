import { z } from "zod";

export const   signupValidation=z.object({
    email:z.string().email({message:"enter valid mail"}),
    
    name:z.string().min(5,{message:"username name is too small"}).max(20,{message:"Username is very large"}),
    photo:z.string().optional(),
    password:z.string().min(5,{message:"password is too small"}).max(20,{message:"password must be less than 20"})
    
})
export const signinValidation=z.object({
    email:z.string().email(),
    password:z.string().min(5,{message:"password is too small"}).max(20,{message:"password must be less than 20"})


})
export const roomValidation=z.object({
    slug:z.string().min(4,{message:"room name is too small"})
})