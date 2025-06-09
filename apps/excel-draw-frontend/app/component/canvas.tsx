"use client";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { Game } from "../draw/Game";
import { useRouter } from "next/navigation";
import { SideBar } from "./canvas/sideBar";
import { TopBar } from "./canvas/topBar";

interface canva {
  roomId: string;
  socket: WebSocket;
}
export type Tool =
  | "circle"
  | "rect"
  | "pencil"
  | "line"
  | "text"
  | "diamond"
  | "rightArrow"
  | "eraser";
export type Stroke = "red" | "white" | "green" | "black" | "blue" | "yellow";
export type Fill =
  | "#FFC9C9"
  | "white"
  | "#B2F2BB"
  | "black"
  | "#FFEC99"
  | "#FFEC99";
export type Width = 1 | 3 | 6;
export type Dots = "solid" | "dotted" | "dashed";
export default function Canvas({ roomId, socket }: canva) {
  const canvasref = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("circle");
  const [selectedStroke, setSelectedStroke] = useState<Stroke>("white");
  const [selectedFill, setSelectedFill] = useState<Fill>("black");
  const [selectedWidth, setSelectedWidth] = useState<Width>(1);
  const [selectedStyle, setSelectedStyle] = useState<Dots>("solid");

  const [game, setGame] = useState<Game>();
  const router = useRouter();
  useEffect(() => {
    const canvas = canvasref.current;
    if (!canvas) return;
    
    // Set initial size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Set initial black background
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const handleResize = () => {
      // Store current canvas content
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      tempCtx.drawImage(canvas, 0, 0);

      // Update canvas size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Restore content and background
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, 0, 0);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    //@ts-ignore
    game?.setTool(selectedTool);
  }, [selectedTool, game]);
  useEffect(() => {
    game?.setStroke(selectedStroke);
  }, [selectedStroke, game]);
  useEffect(() => {
    game?.setFill(selectedFill);
  }, [selectedFill, game]);
  useEffect(() => {
    game?.setWidth(selectedWidth);
  }, [selectedWidth, game]);
  useEffect(() => {
    game?.setStyle(selectedStyle);
  }, [selectedStyle, game]);

  useEffect(() => {
    if (canvasref.current) {
      const g = new Game(canvasref.current, roomId, socket);
      setGame(g);
      return () => {
        g.destroy();
      };
    }
  }, [canvasref]);

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasref}
        width={window.innerWidth}
        height={window.innerHeight}
      ></canvas>
      <TopBar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        id={roomId}
      ></TopBar>
      <SideBar
        selectedStroke={selectedStroke}
        setSelectedStroke={setSelectedStroke}
        selectedFill={selectedFill}
        setSelectedFill={setSelectedFill}
        selectedWidth={selectedWidth}
        setSelectedWidth={setSelectedWidth}
        selectedStyle={selectedStyle}
        setSelectedStyle={setSelectedStyle}
      />
    </div>
  );
}
