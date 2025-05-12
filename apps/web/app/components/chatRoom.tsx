import axios  from "axios"
import { BACKEND_URL } from "../../config"
import { Chatclient } from "./chatClient"
async function getChat(roomId:string){
    const response=await axios.get(`${BACKEND_URL}/chats/${roomId}`)

    return response.data.messages
}
export async function  ChatRoom({id}:{
    id:string

}){
    const chats=await getChat(id)

    return (
       <Chatclient id={id} messages={chats}></Chatclient>
    )

}