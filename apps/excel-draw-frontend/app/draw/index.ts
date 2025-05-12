import { BACKEND_URL } from "@/config";
import axios from "axios";
import { Exo } from "next/font/google";
type Shape = {     
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
}|{
    type:"circle",
    radius:number,
    centerX:number,
    centerY:number
}|{
    type:"line",
    x:number,
    y:number,
    endX:number,
    endY:number

};


export async function initDraw(canvas:HTMLCanvasElement,roomId:string,socket:WebSocket)

{
        const ctx=canvas.getContext("2d")
        let existingShapes:Shape[]=await getExistingShape(roomId)
      
        if(!ctx)
        {
            return false;
        }
        socket.onmessage=(event)=>{
            const message=JSON.parse(event.data)
            if(message.type==='chat')
            {
                const parsedMessage=JSON.parse(message.message)
                existingShapes.push(parsedMessage.shape)
                clearCanvas(existingShapes,canvas,ctx)
            }
        }
        clearCanvas(existingShapes,canvas,ctx)
        let clicked=false
        let startX=0;
        let startY=0;
        canvas.addEventListener("mousedown",(e)=>{
            clicked=true;
            startX=e.clientX;
            startY=e.clientY;

        })
        canvas.addEventListener("mouseup",(e)=>{
            clicked=false
            const width=e.clientX-startX
            const height=e.clientY-startY;
            let shape: Shape | null = null;
            //@ts-ignore
            const selectedTool=window.selectedTool
            if(selectedTool==='rect')
            {
                shape={
                    type:"rect",
                    x:startX,
                    y:startY,
                    width:width,
                    height:height
                }
       
            }else if(selectedTool==='circle')
            {
                const radius=Math.max(width,height)/2;
                shape={
                    type:"circle",
                    radius:radius,
                   centerX:startX+radius,
                   centerY:startY+radius
                }
                
            }else if(selectedTool==='line')
            {
                shape={
                    type:"line",
                    x:startX,
                    y:startY,
                    endX:e.clientX,
                    endY:e.clientY
                }
            }
             if(!shape){
                return null
             }
            existingShapes.push(shape)
            socket.send(JSON.stringify({
                type:'chat',
                message:JSON.stringify({
                    shape
                }),
                roomId
            }))

        })
        canvas.addEventListener("mousemove",(e)=>{
            if(clicked)
            {
                let width=e.clientX-startX;
                let height=e.clientY-startY;
                clearCanvas(existingShapes,canvas,ctx)
                  ctx.strokeStyle = "rgba(255, 255, 255)"
                //@ts-ignore
                const selectedTool=window.selectedTool
                if(selectedTool==="rect")
                {
                   
                   
                    
                    ctx.strokeRect(startX,startY,width,height)
                } else if(selectedTool==="circle")
                {
                    const radius=Math.max(width,height)/2;
                    const centerX=startX +radius;
                    const centerY=startY+ radius;
              
                    ctx.beginPath();
                    ctx.arc(centerX,centerY,radius,0,Math.PI*2);
                    ctx.stroke()
                    ctx.closePath();

                }else if(selectedTool==="line")
                {
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.lineTo(e.clientX, e.clientY);
                
                    ctx.stroke();
                }
             
            }
        })
       async  function getExistingShape(roomId:string)
        {
            const res=await axios.get(`${BACKEND_URL}/chats/${roomId}`)
            const data=res.data.messages;
            const shapes=data.map((x:{message:string})=>{
                const messageData=JSON.parse(x.message)
                return messageData.shape;
            })
            return shapes 
        }
        function clearCanvas(existingShapes:Shape[],canvas:HTMLCanvasElement,ctx:CanvasRenderingContext2D){
            ctx.clearRect(0,0,canvas.width,canvas.height)
            ctx.fillStyle="rgba(0,0,0)"
            ctx.fillRect(0,0,canvas.width,canvas.height)
            existingShapes.map((shape)=>{
                if(shape.type==='rect')
                {
                    ctx.strokeStyle="rgba(255,255,255)"
                    ctx.strokeRect(shape.x,shape.y,shape.width,shape.height);
                } else if(shape.type==='circle')
                {
                        ctx.beginPath();
                        ctx.arc(shape.centerX,shape.centerY,shape.radius,0,Math.PI*2);
                        ctx.stroke();
                        ctx.closePath()
                }else if(shape.type==="line")
                {
                    ctx.beginPath();
                    ctx.moveTo(shape.x, shape.y);
                    ctx.lineTo(shape.endX, shape.endY);
                
                    ctx.stroke();
                }
            })
           
        }
}