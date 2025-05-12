import RoomCanvas from "@/app/component/roomCanvas"
import { BACKEND_URL } from "@/config"
import axios from "axios"

async function getRoomId(slug:string){
 const response=await axios.get(`${BACKEND_URL}/room/${slug}`)

 return response.data.room.id
}

export default async function JoinRoom({params}:{
    params:{
        roomid:string
    }
}){
    const slug=(await params).roomid
    const roomId=await getRoomId(slug)
    return <RoomCanvas id={roomId} />
}