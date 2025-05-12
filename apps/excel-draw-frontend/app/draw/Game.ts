import { getExistingShape } from "./https";
import { Tool, Stroke, Fill, Width, Dots } from "../component/canvas";

type Shape =
  | {
      id: string;
      type: "rect";

      x: number;
      y: number;
      width: number;
      height: number;
      stroke: string;
      fill: string;
      strokeWidth: number;
      strokeStyle: string;
    }
  | {
      id: string;
      type: "circle";
      radius: number;
      centerX: number;
      centerY: number;
      stroke: string;
      fill: string;
      strokeWidth: number;
      strokeStyle: string;
    }
  | {
      id: string;
      type: "line";
      x: number;
      y: number;
      endX: number;
      endY: number;
      arrow: boolean;
      stroke: string;
      fill: string;
      strokeWidth: number;
      strokeStyle: string;
    }
  | {
      id: string;
      type: "pencil";
      x: number;
      y: number;
      endX: number;
      endY: number;
      path?: { x: number; y: number }[];
      stroke: string;
      fill: string;
      strokeWidth: number;
      strokeStyle: string;
    }
  | {
      id: string;
      type: "diamond";
      x: number;
      y: number;
      size: number;
      stroke: string;
      fill: string;
      strokeWidth: number;
      strokeStyle: string;
    }
  | {
      id: string;
      type: "text";
      x: number;
      y: number;
      endX: number;
      endY: number;
      text: string;
      stroke: string;
      fill: string;
      strokeWidth: number;
      strokeStyle?: string;
    }
  | {
      id: string;
      type: "rightArrow";
      x: number;
      y: number;
      endX: number;
      endY: number;
      arrow: boolean;
      stroke: string;
      fill: string;
      strokeWidth: number;
      strokeStyle: string;
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[];
  private roomId: string;
  socket: WebSocket;
  private clicked: boolean;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";
  private selectedStroke: Stroke = "white";
  private selectedFill: Fill = "black";
  private selectedWidth: Width = 1;
  private selectedStyle: Dots = "solid";

  private tempPath: { x: number; y: number }[] = [];
  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.existingShapes = [];
    this.roomId = roomId;
    this.socket = socket;
    this.clicked = false;
    this.init();
    this.initHandler();
    this.initMouseHandler();
  }
  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }
  setTool(
    tool:
      | "circle"
      | "pencil"
      | "rect"
      | "text"
      | "line"
      | "diamond"
      | "rightArrow"
      | "eraser"
  ) {
    this.selectedTool = tool;
  }
  setStroke(stroke: "black" | "red" | "yellow" | "green" | "blue" | "white") {
    this.selectedStroke = stroke;
  }
  setFill(
    fill: "black" | "#FFC9C9" | "#FFEC99" | "#B2F2BB" | "#FFEC99" | "white"
  ) {
    this.selectedFill = fill;
  }
  setWidth(width: 1 | 3 | 6) {
    this.selectedWidth = width;
  }
  setStyle(dots: "solid" | "dotted" | "dashed") {
    this.selectedStyle = dots;
  }
  async init() {
    this.existingShapes = await getExistingShape(this.roomId);
    console.log(this.roomId);
    console.log(this.selectedStroke);
    this.clearCanvas();
  }
  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    this.startX = x;
    this.startY = y;

    if (this.selectedTool === "pencil") {
      this.tempPath = [{ x: this.startX, y: this.startY }];
      this.ctx.beginPath();
      this.ctx.lineWidth = this.selectedWidth;
      this.ctx.strokeStyle = this.selectedStroke;
      this.ctx.fillStyle = this.selectedFill;
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
    } else if (this.selectedTool === "text") {
      this.clicked = false;
      this.addInput(x, y);
    } else if (this.selectedTool === "eraser") {
      this.eraseShape(x, y);
      return;
    }
  };
  mouseUpHandler = (e: MouseEvent) => {
    if (!this.clicked) return;
    this.clicked = false;

    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = x - this.startX;
    const height = y - this.startY;

    let shape: Shape | null = null;
    const selectedTool = this.selectedTool;
    const selectedStroke = this.selectedStroke;
    const selectedFill = this.selectedFill;
    const selectedWidth = this.selectedWidth;
    const selectedStyle = this.selectedStyle;
    if (selectedTool === "rect") {
      shape = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: "rect",
        x: this.startX,
        y: this.startY,
        width: width,
        height: height,
        stroke: selectedStroke,
        fill: selectedFill,
        strokeWidth: selectedWidth,
        strokeStyle: selectedStyle,
      };
    } else if (selectedTool === "circle") {
      const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
      const centerX = this.startX + width / 2;
      const centerY = this.startY + height / 2;

      shape = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: "circle",
        radius: radius,
        centerX: centerX,
        centerY: centerY,
        stroke: selectedStroke,
        fill: selectedFill,
        strokeWidth: selectedWidth,
        strokeStyle: selectedStyle,
      };
    } else if (selectedTool === "line") {
      shape = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: "line",
        x: this.startX,
        y: this.startY,
        endX: x,
        endY: y,
        stroke: selectedStroke,
        arrow: false,
        fill: selectedFill,
        strokeWidth: selectedWidth,
        strokeStyle: selectedStyle,
      };
    } else if (selectedTool === "rightArrow") {
      shape = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: "line",
        x: this.startX,
        y: this.startY,
        endX: x,
        endY: y,
        stroke: selectedStroke,
        arrow: true,
        fill: selectedFill,
        strokeWidth: selectedWidth,
        strokeStyle: selectedStyle,
      };
    } else if (selectedTool === "pencil") {
      shape = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: "pencil",
        x: 0,
        y: 0,
        endX: 0,
        endY: 0,
        path: [...this.tempPath],
        stroke: selectedStroke,
        fill: selectedFill,
        strokeWidth: selectedWidth,
        strokeStyle: selectedStyle,
      };
      this.tempPath = [];
    } else if (selectedTool === "diamond") {
      const size = Math.max(Math.abs(width), Math.abs(height));
      shape = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        type: "diamond",
        x: this.startX,
        y: this.startY,
        size: size,
        stroke: selectedStroke,
        fill: selectedFill,
        strokeWidth: selectedWidth,
        strokeStyle: selectedStyle,
      };
    }

    if (shape) {
      this.existingShapes.push(shape);
      this.socket.send(
        JSON.stringify({
          type: "chat",
          message: JSON.stringify({ shape }),
          id: shape.id,
          roomId: this.roomId,
        })
      );
    }
  };

  mouseMoveHandler = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.clicked) {
      const width = x - this.startX;
      const height = y - this.startY;
      this.clearCanvas();
      this.ctx.strokeStyle = this.selectedStroke;
      this.ctx.fillStyle = this.selectedFill;
      this.ctx.lineWidth = this.selectedWidth;

      const selectedTool = this.selectedTool;
      switch (this.selectedStyle) {
        case "solid":
          this.ctx.setLineDash([]);
          break;
        case "dotted":
          this.ctx.setLineDash([this.selectedWidth, this.selectedWidth * 2]); // Increased dot spacing
          break;
        case "dashed":
          this.ctx.setLineDash([
            this.selectedWidth * 4,
            this.selectedWidth * 2,
          ]); // Increased dot spacing
          break;
        default:
          this.ctx.setLineDash([]); // Default to solid
      }
      if (selectedTool === "rect") {
        this.drawRect(this.startX, this.startY, width, height);
      } else if (selectedTool === "circle") {
        const radius = Math.max(Math.abs(width), Math.abs(height)) / 2;
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
      } else if (selectedTool === "line") {
        this.drawLine(this.startX, this.startY, x, y, false);
      } else if (selectedTool === "rightArrow") {
        this.drawLine(this.startX, this.startY, x, y, true);
      } else if (this.selectedTool === "pencil") {
        const lastPoint = this.tempPath[this.tempPath.length - 1];
        const distance = Math.sqrt(
          Math.pow(x - lastPoint.x, 2) + Math.pow(y - lastPoint.y, 2)
        );
        if (distance > 2) {
          requestAnimationFrame(() => {
            this.drawPencil(x, y);
          });
        }
      } else if (this.selectedTool === "diamond") {
        const size = Math.max(Math.abs(width), Math.abs(height));
        this.ctx.beginPath();
        this.ctx.moveTo(this.startX, this.startY - size);
        this.ctx.lineTo(this.startX + size, this.startY);
        this.ctx.lineTo(this.startX, this.startY + size);
        this.ctx.lineTo(this.startX - size, this.startY);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
      } else if (this.selectedTool === "eraser") {
        this.eraseShape(x, y);
        return;
      }
    }
  };
  drawRect(startX: number, startY: number, width: number, height: number) {
    this.ctx.beginPath();
    this.ctx.rect(startX, startY, width, height);
    this.ctx.fill();
    this.ctx.stroke();
  }
  drawLine(
    startX: number,
    startY: number,
    x: number,
    y: number,
    arrow: boolean
  ) {
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    if (arrow == false) return;

    const arrowLength = 10;
    const angle = Math.atan2(y - startY, x - startX);

    this.ctx.beginPath();

    this.ctx.moveTo(x, y);
    this.ctx.lineTo(
      x - arrowLength * Math.cos(angle - Math.PI / 6),
      y - arrowLength * Math.sin(angle - Math.PI / 6)
    );

    this.ctx.moveTo(x, y);
    this.ctx.lineTo(
      x - arrowLength * Math.cos(angle + Math.PI / 6),
      y - arrowLength * Math.sin(angle + Math.PI / 6)
    );

    this.ctx.stroke();
  }
  drawPencil(x: number, y: number) {
    this.tempPath.push({ x, y });
    this.ctx.lineWidth = this.selectedWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(this.tempPath[0].x, this.tempPath[0].y);

    for (let i = 1; i < this.tempPath.length; i++) {
      const xc = (this.tempPath[i].x + this.tempPath[i - 1].x) / 2;
      const yc = (this.tempPath[i].y + this.tempPath[i - 1].y) / 2;
      this.ctx.quadraticCurveTo(
        this.tempPath[i - 1].x,
        this.tempPath[i - 1].y,
        xc,
        yc
      );
    }

    this.ctx.stroke();
  }
  initHandler() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      if (message.type === "chat") {
        const parsedMessage = JSON.parse(message.message);
        console.log(parsedMessage);
        this.existingShapes.push(parsedMessage.shape);
        this.clearCanvas();
      } else if (message.type === "eraser") {
        this.existingShapes = this.existingShapes.filter(
          (shape) => shape.id !== message.id
        );
        this.clearCanvas();
      }
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "rgba(0,0,0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.existingShapes.map((shape) => {
      this.ctx.save();
      switch (shape.strokeStyle) {
        case "solid":
          this.ctx.setLineDash([]);
          break;
        case "dotted":
          this.ctx.setLineDash([shape.strokeWidth, shape.strokeWidth * 2]); // Increased dot spacing
          break;
        case "dashed":
          this.ctx.setLineDash([shape.strokeWidth * 4, shape.strokeWidth * 2]); // Longer dashes with more space
          break;
        default:
          this.ctx.setLineDash([]); // Default to solid
      }
      this.ctx.fillStyle = shape.fill;
      this.ctx.strokeStyle = shape.stroke;

      if (shape.type === "rect") {
        this.drawRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.lineWidth = shape.strokeWidth;
        this.ctx.beginPath();
        this.ctx.arc(
          shape.centerX,
          shape.centerY,
          shape.radius,
          0,
          Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.stroke();
      } else if (shape.type === "line") {
        this.drawLine(shape.x, shape.y, shape.endX, shape.endY, shape.arrow);
      } else if (shape.type === "rightArrow") {
        this.drawLine(shape.x, shape.y, shape.endX, shape.endY, shape.arrow);
      } else if (shape.type === "pencil") {
        const path = shape.path;
        if (!path || path.length === 0) {
          return;
        }
        this.ctx.lineWidth = shape.strokeWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          this.ctx.lineTo(path[i].x, path[i].y);
        }
        this.ctx.stroke();
      } else if (shape.type === "diamond") {
        this.ctx.lineWidth = shape.strokeWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(shape.x, shape.y - shape.size);
        this.ctx.lineTo(shape.x + shape.size, shape.y);
        this.ctx.lineTo(shape.x, shape.y + shape.size);
        this.ctx.lineTo(shape.x - shape.size, shape.y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
      } else if (shape.type === "text") {
        this.ctx.font = "24px Comic Sans MS, cursive";
        this.ctx.fillText(shape.text, shape.x, shape.y);
      }
    });
  }
  eraseShape(x: number, y: number) {
    const shape = this.existingShapes.find((shape) => {
      if (shape.type === "rect") {
        return (
          x >= shape.x &&
          x <= shape.x + shape.width &&
          y >= shape.y &&
          y <= shape.y + shape.height
        );
      } else if (shape.type === "circle") {
        const dx = x - shape.centerX;
        const dy = y - shape.centerY;
        return dx * dx + dy * dy <= shape.radius * shape.radius;
      } else if (shape.type === "line") {
        return this.isPointOnLine(shape, x, y);
      } else if (shape.type === "pencil") {
        return shape.path?.some(
          (point) => Math.abs(point.x - x) < 5 && Math.abs(point.y - y) < 5
        );
      } else if (shape.type === "diamond") {
        return this.isPointInDiamond(shape, x, y);
      } else if (shape.type === "text") {
        const metrics = this.ctx.measureText(shape.text);
        return (
          x >= shape.x &&
          x <= shape.x + metrics.width &&
          y >= shape.y - 24 &&
          y <= shape.y
        );
      }
      return false;
    });

    if (shape) {
      this.existingShapes = this.existingShapes.filter(
        (s) => s.id !== shape.id
      );
      this.clearCanvas();

      this.socket.send(
        JSON.stringify({
          type: "eraser",
          id: shape.id,
          roomId: this.roomId,
        })
      );
    }
  }

  isPointOnLine(shape: Shape & { type: "line" }, x: number, y: number) {
    const { x: x1, y: y1, endX: x2, endY: y2 } = shape;
    const distToStart = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
    const distToEnd = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);
    const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    return Math.abs(distToStart + distToEnd - lineLength) < 3;
  }
  isPointInDiamond(shape: Shape & { type: "diamond" }, x: number, y: number) {
    const { x: cx, y: cy, size } = shape;
    return Math.abs(x - cx) / size + Math.abs(y - cy) / size <= 1;
  }
  drawText(text: string, x: number, y: number) {
    this.ctx.font = "24px Comic Sans MS, cursive";
    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "left";

    const metrics = this.ctx.measureText(text);
    const lineHeight = 24;

    this.ctx.fillStyle = this.selectedStroke;
    this.ctx.fillText(text, x, y);

    return {
      width: metrics.width,
      height: lineHeight,
    };
  }
  addInput(x: number, y: number) {
    const input = document.createElement("input");
    input.type = "text";
    input.style.position = "absolute";
    input.style.left = `${x}px`;
    input.style.top = `${y}px`;
    input.style.background = "transparent";
    input.style.color = this.selectedStroke;
    input.style.outline = "none";
    input.style.border = "none";
    input.style.fontSize = "24px";
    input.style.fontFamily = "Comic Sans MS, cursive";
    input.style.maxWidth = "180px";
    document.body.appendChild(input);
    setTimeout(() => input.focus(), 0);

    const handleSubmit = () => {
      if (input.value.trim() !== "") {
        const dimensions = this.drawText(input.value, x, y);

        let shape: Shape | null = null;
        const selectedStroke = this.selectedStroke;
        const selectedFill = this.selectedFill;

        if (this.selectedTool === "text") {
          shape = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
            type: "text",
            x: x,
            y: y,
            endX: x + dimensions.width,
            endY: y + dimensions.height,
            text: input.value.trim(),
            stroke: selectedStroke,
            fill: selectedStroke,
            strokeWidth: this.selectedWidth,
          };
          this.existingShapes.push(shape);
          this.socket.send(
            JSON.stringify({
              type: "chat",
              message: JSON.stringify({
                shape,
              }),
              roomId: this.roomId,
              id: shape.id,
            })
          );
        }
      }
      document.body.removeChild(input);
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
    });
    const handleClickOutside = (e: MouseEvent) => {
      if (!input.contains(e.target as Node)) {
        handleSubmit();
      }
    };

    setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 10);

    input.addEventListener("blur", () => {
      document.removeEventListener("mousedown", handleClickOutside);
    });
  }
  initMouseHandler() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }
}
