"use client";

import { useEffect } from "react";
import useSocket from "../hooks/useSocket";
import Canvas from "./canvas";

type RoomCanvasProps = {
  id: string;
};

export default function RoomCanvas({ id }: RoomCanvasProps) {
  const { loading, socket } = useSocket();

  useEffect(() => {
    if (socket && !loading) {
      socket.send(
        JSON.stringify({
          type: "join",
          roomId: id,
        })
      );
    }
  }, [socket, loading, id]);

  if (loading || !socket) {
    return (
      <div className="h-screen w-screen bg-black">
        <div className="flex h-full w-full justify-center items-center">
          <img
            src="/1494.gif" 
            alt="Loading animation"
            width={200}
            height={200}
          
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Canvas roomId={id} socket={socket} />
    </div>
  );
}
