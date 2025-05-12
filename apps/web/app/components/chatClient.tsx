"use client"
import { useEffect, useState } from "react"
import { useSocket } from "../Hooks/useSocket"

export  function Chatclient({id,messages}:{
    id:string,
    messages:{message:string}[]
}){
    const[chats,setChats]=useState(messages)
    const[currentMessage,setCurrentMessage]=useState("")
    console.log(messages)
    const{loading,socket}=useSocket();
    useEffect(()=>{
        if(socket && !loading)
        {
            socket.send(JSON.stringify({
                type:"join",
                roomId:id
            }))
        
            socket.onmessage = (event: { data: string }) => {
           
                const msg = JSON.parse(event.data);
     
         
                setChats((prevMessages) => [...prevMessages, msg]);
               
            
        }
        }
    },[socket,loading,id])
    return (
        <div>
      {chats.map((m,i) => <div key={i}>{m.message}</div>)}
      <div> 
        <input type="text" value={currentMessage} onChange={(e)=>{
            setCurrentMessage(e.target.value)
        }} ></input>
        <button
        onClick={()=>{
            socket?.send(JSON.stringify({
                type:"chat",
                roomId:id,
                message:currentMessage
            }))
            setCurrentMessage("");
        }}
        >Send</button>
      </div>
        </div>
        
    )
}