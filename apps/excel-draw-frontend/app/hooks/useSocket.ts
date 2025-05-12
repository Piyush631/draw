import { WS_URL } from "@/config";
import { useEffect, useState } from "react";

export default function useSocket(){
    const [socket,setSocket]=useState<WebSocket>();
    const[loading,setLoading]=useState(true)
    useEffect(()=>{
        const token=localStorage.getItem("token")
         const ws=new WebSocket(`${WS_URL}?token=${token}`)
         ws.onopen=()=>{
            setLoading(false)
            setSocket(ws)
         }
    },[])
    return {
        loading,
        socket
    }
}