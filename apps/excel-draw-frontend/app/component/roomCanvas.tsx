"use client";
import { useEffect } from "react";
import useSocket from "../hooks/useSocket";
import Canvas from "./canvas";

export default function RoomCanvas({ id }: { id: string }) {
  const { loading, socket } = useSocket();
  console.log(id);
  useEffect(() => {
    if (socket && !loading) {
      socket.send(
        JSON.stringify({
          type: "join",
          roomId: id,
        })
      );
    }
  });
  if (!socket) {
    return (
      <div className="h-screen w-screen bg-black">
        <div className="h-full w-full flex justify-center items-center">
          <img src="/1494.gif" className=""></img>
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
