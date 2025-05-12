import { BACKEND_URL } from "@/config";
import axios from "axios";

 export async  function getExistingShape(roomId:string)
{
    const res=await axios.get(`${BACKEND_URL}/chats/${roomId}`)
    const data=res.data.messages;
    const shapes=data.map((x:{message:string})=>{
        const messageData=JSON.parse(x.message)
        return messageData.shape;
    })
    return shapes 
}