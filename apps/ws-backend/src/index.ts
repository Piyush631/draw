import http from "http";
import { WebSocket, WebSocketServer } from "ws";
import { client } from "@repo/database/db";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/common-backend/config";

// Use Render-assigned port or default to 8090 for local testing
const PORT = process.env.PORT || 8090;

// Create an HTTP server (important for Render's health checks and HTTPS support)
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("WebSocket server is running");
});

// Attach WebSocket server to HTTP server
const ws = new WebSocketServer({
  server,
  perMessageDeflate: false,
  clientTracking: true
});

server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});

interface usersType {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: usersType[] = [];

function checkuser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string" || !decoded || !decoded.userId) {
      return null;
    }
    return String(decoded.userId);
  } catch (e) {
    console.error("Token verification failed:", e);
    return null;
  }
}

ws.on("connection", function connection(ws, request) {
  console.log("New connection attempt");

  const url = request.url;
  if (!url) {
    console.log("No URL provided");
    ws.close();
    return;
  }

  const queryparams = new URLSearchParams(url.split("?")[1]);
  const token = queryparams.get("token") || "";
  const userId = checkuser(token);

  if (userId === null) {
    console.log("Invalid token");
    ws.close();
    return;
  }

  console.log("User connected:", userId);

  users.push({ userId, rooms: [], ws });

  ws.send(JSON.stringify({
    type: "connection",
    status: "connected",
    userId
  }));

  ws.on("message", async function message(data) {
    try {
      const parsedData = typeof data === "string" ? JSON.parse(data) : JSON.parse(data.toString());
      console.log("Received message:", parsedData.type);

      const user = users.find((x) => x.ws === ws);

      if (parsedData.type === "join" && user) {
        user.rooms.push(parsedData.roomId);
        console.log(`User ${userId} joined room ${parsedData.roomId}`);
      }

      if (parsedData.type === "leave" && user) {
        user.rooms = user.rooms.filter((x) => x !== parsedData.room);
        console.log(`User ${userId} left room ${parsedData.room}`);
      }

      if (parsedData.type === "eraser") {
        const { roomId, id } = parsedData;
        await client.chat.deleteMany({ where: { id } });
        users.forEach((user) => {
          if (user.rooms.includes(roomId)) {
            user.ws.send(JSON.stringify({ type: "eraser", roomId, id }));
          }
        });
      }

      if (parsedData.type === "chat") {
        const { roomId, message, id } = parsedData;

        const userRecord = await client.user.findUnique({
          where: { id: String(userId) }
        });

        if (!userRecord) {
          ws.send(JSON.stringify({ type: "error", message: "User not found" }));
          return;
        }

        await client.chat.create({
          data: {
            id,
            roomid: Number(roomId),
            message,
            userid: String(userId),
          },
        });

        users.forEach((user) => {
          if (user.rooms.includes(roomId)) {
            user.ws.send(JSON.stringify({ type: "chat", message, roomId, id }));
          }
        });
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(JSON.stringify({ type: "error", message: "Failed to process message" }));
    }
  });

  ws.on("close", () => {
    const index = users.findIndex((x) => x.ws === ws);
    if (index !== -1) {
      users.splice(index, 1);
      console.log(`User ${userId} disconnected`);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});
