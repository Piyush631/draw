"use client";
import { useEffect, useRef } from "react";
import { useState } from "react";
import { Game } from "../draw/Game";
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
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const [game, setGame] = useState<Game>();

  useEffect(() => {
    const canvas = canvasref.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;
    const zoomFactor = delta > 0 ? 0.9 : 1.1;
    
    // Get mouse position relative to canvas
    const rect = canvasref.current?.getBoundingClientRect();
    if (!rect) return;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate new scale
    const newScale = Math.max(0.1, Math.min(10, scale * zoomFactor));
    
    // Calculate new offset to zoom towards mouse position
    const newOffsetX = offsetX - (mouseX - offsetX) * (zoomFactor - 1);
    const newOffsetY = offsetY - (mouseY - offsetY) * (zoomFactor - 1);
    
    setScale(newScale);
    setOffsetX(newOffsetX);
    setOffsetY(newOffsetY);
    
    if (game) {
      game.setTransform(newScale, newOffsetX, newOffsetY);
    }
  };

  useEffect(() => {
    const canvas = canvasref.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [scale, offsetX, offsetY, game]);

  useEffect(() => {
  
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
  }, [canvasref, roomId, socket]);

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
