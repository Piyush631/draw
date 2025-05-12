"use client"
import { useEffect, useState } from "react"
import { WS_URL } from "../../config";

export function useSocket(){
    const [loading,setLoading]=useState(true)
    const [socket,setSocket]=useState<WebSocket>();
    useEffect(()=>{
        const ws=new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmYzIwNWJlOS1kNTY1LTQ1ZjMtYTZiNS05ZWEzMWE4NTBhODAiLCJpYXQiOjE3NDIzNzI4ODd9.OfcmLR-YWQF61sloDFXf826wGkP3EK-DiUDNWNAQ0Ss`)
        ws.onopen=()=>{
            setLoading(false)
            setSocket(ws)
        }
    },[]);
    return {
            loading,
            socket
    }
        
    
}