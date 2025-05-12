"use client"

import { useRouter } from "next/navigation";
import { useState } from "react"

export default function Home() {
  const[roomid,setRoomid]=useState("");
  const router=useRouter()
  return (
   <div className="h-screen w-screen">
    <div className="h-full w-full border-2 flex flex-col justify-center items-center">
      <div>Create your Room Id</div>
      <div>
        <input type="text" value={roomid} onChange={(e)=>{
          setRoomid(e.target.value)
        }} />
        <button onClick={()=>{
          router.push(`/room/${roomid}`)
        }}>Join room </button>
      </div>
    </div>

   </div>
      )

}