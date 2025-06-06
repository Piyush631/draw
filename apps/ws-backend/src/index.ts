import { WebSocket, WebSocketServer } from "ws";
import { client } from "@repo/database/db";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/common-backend/config";

const PORT = process.env.PORT || 1000;
const ws = new WebSocketServer({ port: Number(PORT) });

console.log(`WebSocket server is running on port ${PORT}`);

interface usersType {
  ws: WebSocket;
  rooms: string[];
  userId: string;
  isAlive: boolean;
  lastPing: number;
  connectionTime: number;
}

const users: usersType[] = [];
const MAX_CONNECTIONS_PER_USER = 4; 

const PING_INTERVAL = 30000;
const PONG_TIMEOUT = 10000;

function checkuser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string") return null;
    if (!decoded || !decoded.userId) return null;
    return decoded.userId;
  } catch (e) {
    console.error("Token verification failed:", e);
    return null;
  }
}

function getUserConnections(userId: string): usersType[] {
  return users.filter(u => u.userId === userId && u.isAlive);
}

function cleanupOldConnections(userId: string) {
  const userConnections = getUserConnections(userId);
  if (userConnections.length > MAX_CONNECTIONS_PER_USER) {
    userConnections
      .sort((a, b) => b.connectionTime - a.connectionTime)
      .slice(MAX_CONNECTIONS_PER_USER)
      .forEach(connection => {
        connection.ws.close(1000, "Too many concurrent connections");
        const index = users.findIndex(u => u.ws === connection.ws);
        if (index !== -1) users.splice(index, 1);
      });
  }
}

const interval = setInterval(() => {
  const now = Date.now();
  users.forEach((user) => {
    if (!user.isAlive && (now - user.lastPing) > PONG_TIMEOUT) {
      console.log(`User ${user.userId} connection timed out.`);
      user.ws.terminate();
      const index = users.findIndex(u => u.ws === user.ws);
      if (index !== -1) users.splice(index, 1);
      return;
    }

    user.isAlive = false;
    user.lastPing = now;
    user.ws.ping();
  });
}, PING_INTERVAL);

ws.on("connection", function connection(ws: WebSocket, request: any) {
  const url = request.url;
  if (!url) {
    ws.close(1008, "No URL provided");
    return;
  }

  const queryparams = new URLSearchParams(url.split("?")[1]);
  const token = queryparams.get("token") || "";
  const userId = checkuser(token);

  if (userId === null) {
    ws.close(1008, "Invalid or missing token");
    return;
  }

  cleanupOldConnections(userId);

  const newUser: usersType = {
    userId,
    rooms: [],
    ws,
    isAlive: true,
    lastPing: Date.now(),
    connectionTime: Date.now()
  };

  users.push(newUser);
  console.log(`User ${userId} connected. Total users: ${users.length}`);

  ws.on('pong', () => {
    const user = users.find(u => u.ws === ws);
    if (user) {
      user.isAlive = true;
      console.log(`Received pong from user ${userId}`);
    }
  });

  ws.on("message", async (data: any) => {
    try {
      const parsedData = typeof data === "string" ? JSON.parse(data) : JSON.parse(data.toString());
      const user = users.find((x) => x.ws === ws);
      if (!user) return;

      if (parsedData.type === "join") {
        if (!user.rooms.includes(parsedData.roomId)) {
          user.rooms.push(parsedData.roomId);
          console.log(`User ${userId} joined room ${parsedData.roomId}`);
        }
      }

      if (parsedData.type === "leave") {
        user.rooms = user.rooms.filter((x) => x !== parsedData.room);
        console.log(`User ${userId} left room ${parsedData.room}`);
      }

      if (parsedData.type === "eraser") {
        try {
          await client.chat.deleteMany({ where: { id: parsedData.id } });
          users.forEach((u) => {
            if (u.rooms.includes(parsedData.roomId)) {
              u.ws.send(JSON.stringify({
                type: "eraser",
                roomId: parsedData.roomId,
                id: parsedData.id,
              }));
            }
          });
        } catch (err) {
          console.error("Error deleting chat:", err);
        }
      }

      if (parsedData.type === "chat") {
        try {
          await client.chat.create({
            data: {
              id: parsedData.id,
              roomid: Number(parsedData.roomId),
              message: parsedData.message,
              userid: userId,
            }
          });

          users.forEach((u) => {
            if (u.rooms.includes(parsedData.roomId)) {
              u.ws.send(JSON.stringify({
                type: "chat",
                roomId: parsedData.roomId,
                message: parsedData.message,
                id: parsedData.id,
              }));
            }
          });
        } catch (err) {
          console.error("Error saving chat:", err);
        }
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  });

  ws.on("close", (code, reason) => {
    const index = users.findIndex((u) => u.ws === ws);
    if (index !== -1) {
      console.log(`User ${userId} disconnected: ${reason}`);
      users.splice(index, 1);
    }
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error for user ${userId}:`, error);
    const index = users.findIndex((u) => u.ws === ws);
    if (index !== -1) users.splice(index, 1);
  });
});

ws.on('close', () => {
  clearInterval(interval);
});
