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
const RECENT_CONNECTIONS = new Map<string, number>();
const CONNECTION_COOLDOWN = 2000; // 2 seconds cooldown between reconnections
const MAX_CONNECTIONS_PER_USER = 3; // Maximum number of concurrent connections per user

// Ping interval in milliseconds
const PING_INTERVAL = 30000;
const PONG_TIMEOUT = 10000;

function checkuser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string") {
      return null;
    }
    if (!decoded || !decoded.userId) {
      return null;
    }
    return decoded.userId;
  } catch (e) {
    console.error("Token verification failed:", e);
    return null;
  }
}

// Function to get active connections for a user
function getUserConnections(userId: string): usersType[] {
  return users.filter(u => u.userId === userId && u.isAlive);
}

// Function to clean up old connections for a user
function cleanupOldConnections(userId: string) {
  const userConnections = getUserConnections(userId);
  if (userConnections.length > MAX_CONNECTIONS_PER_USER) {
    // Sort by connection time and keep only the newest connections
    userConnections
      .sort((a, b) => b.connectionTime - a.connectionTime)
      .slice(MAX_CONNECTIONS_PER_USER)
      .forEach(connection => {
        connection.ws.close(1000, "Too many concurrent connections");
        const index = users.findIndex(u => u.ws === connection.ws);
        if (index !== -1) {
          users.splice(index, 1);
        }
      });
  }
}

// Set up ping interval
const interval = setInterval(() => {
  const now = Date.now();
  users.forEach((user) => {
    if (!user.isAlive && (now - user.lastPing) > PONG_TIMEOUT) {
      console.log(`User ${user.userId} connection timed out after ${now - user.lastPing}ms`);
      user.ws.terminate();
      const index = users.findIndex(u => u.ws === user.ws);
      if (index !== -1) {
        users.splice(index, 1);
      }
      return;
    }
    
    if (user.isAlive) {
      user.isAlive = false;
      user.lastPing = now;
      user.ws.ping();
    }
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

  const now = Date.now();
  const lastConnection = RECENT_CONNECTIONS.get(userId);
  
  // Check if this is a rapid reconnection
  if (lastConnection && (now - lastConnection) < CONNECTION_COOLDOWN) {
    console.log(`Rapid reconnection detected for user ${userId}. Ignoring.`);
    ws.close(1000, "Rapid reconnection detected");
    return;
  }

  // Update last connection time
  RECENT_CONNECTIONS.set(userId, now);

  // Clean up old connections for this user
  cleanupOldConnections(userId);

  const newUser = {
    userId,
    rooms: [],
    ws,
    isAlive: true,
    lastPing: now,
    connectionTime: now
  };

  users.push(newUser);

  console.log(`User ${userId} connected. Total users: ${users.length}`);

  // Set up ping/pong handlers
  ws.on('pong', () => {
    const user = users.find(u => u.ws === ws);
    if (user) {
      user.isAlive = true;
      console.log(`Received pong from user ${userId}`);
    }
  });

  ws.on("message", async function message(data: any) {
    try {
      let parsedData;
      if (typeof data !== "string") {
        parsedData = JSON.parse(data.toString());
      } else {
        parsedData = JSON.parse(data);
      }

      if (parsedData.type === "join") {
        const user = users.find((x) => x.ws === ws);
        if (user) {
          // Check if user is already in the room
          if (!user.rooms.includes(parsedData.roomId)) {
            user.rooms.push(parsedData.roomId);
            console.log(`User ${userId} joined room ${parsedData.roomId}. Current rooms: ${user.rooms.join(', ')}`);
          } else {
            console.log(`User ${userId} already in room ${parsedData.roomId}`);
          }
        }
      }

      if (parsedData.type === "leave") {
        const user = users.find((x) => x.ws === ws);
        if (user) {
          const previousRooms = [...user.rooms];
          user.rooms = user.rooms.filter((x) => x !== parsedData.room);
          console.log(`User ${userId} left room ${parsedData.room}. Previous rooms: ${previousRooms.join(', ')}. Current rooms: ${user.rooms.join(', ')}`);
        }
      }

      if (parsedData.type === "eraser") {
        const roomId = parsedData.roomId;
        const id = parsedData.id;
        try {
          await client.chat.deleteMany({
            where: {
              id: id,
            },
          });
          users.forEach((user) => {
            if (user.rooms.includes(roomId)) {
              user.ws.send(
                JSON.stringify({
                  type: "eraser",
                  roomId,
                  id,
                })
              );
            }
          });
        } catch (error) {
          console.error("Error deleting chat:", error);
        }
      }

      if (parsedData.type === "chat") {
        const roomId = parsedData.roomId;
        const message = parsedData.message;
        const id = parsedData.id;
        try {
          await client.chat.create({
            data: {
              id: id,
              roomid: Number(roomId),
              message,
              userid: userId.toString(),
            },
          });

          users.forEach((user) => {
            if (user.rooms.includes(roomId)) {
              user.ws.send(
                JSON.stringify({
                  type: "chat",
                  message: message,
                  roomId,
                  id,
                })
              );
            }
          });
        } catch (error) {
          console.error("Error creating chat:", error);
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  ws.on("close", (code, reason) => {
    const userIndex = users.findIndex((u) => u.ws === ws);
    if (userIndex !== -1) {
      const user = users[userIndex];
      console.log(`User ${userId} disconnected with code ${code} and reason: ${reason}. Rooms: ${user.rooms.join(', ')}`);
      users.splice(userIndex, 1);
      console.log(`Total users after disconnect: ${users.length}`);
    }
  });

  ws.on("error", (error: Error) => {
    console.error(`WebSocket error for user ${userId}:`, error);
    const userIndex = users.findIndex((u) => u.ws === ws);
    if (userIndex !== -1) {
      const user = users[userIndex];
      console.log(`Removing user ${userId} due to error. Rooms: ${user.rooms.join(', ')}`);
      users.splice(userIndex, 1);
      console.log(`Total users after error: ${users.length}`);
    }
  });
});

// Clean up on server shutdown
ws.on('close', () => {
  clearInterval(interval);
});
