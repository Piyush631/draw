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
}

const users: usersType[] = [];

function checkuser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("hi",decoded);
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

ws.on("connection", function connection(ws, request) {
  const url = request.url;
  console.log("hi",url);
  if (!url) {
 
    ws.close(1008, "No URL provided");
    return;
  }

  const queryparams = new URLSearchParams(url.split("?")[1]);
  console.log("hi",queryparams);
  const token = queryparams.get("token") || "";
  console.log("hi",token);
  const userId = checkuser(token);

  if (userId === null) {
    ws.close(1008, "Invalid or missing token");
    return;
  }

  // Remove any existing connection for this user
  const existingUserIndex = users.findIndex(u => u.userId === userId);
  if (existingUserIndex !== -1) {
    const existingUser = users[existingUserIndex];
    if (existingUser) {
      existingUser.ws.close(1000, "New connection established");
      users.splice(existingUserIndex, 1);
    }
  }

  users.push({
    userId,
    rooms: [],
    ws,
  });

  console.log(`User ${userId} connected. Total users: ${users.length}`);

  ws.on("message", async function message(data) {
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
          user.rooms.push(parsedData.roomId);
          console.log(`User ${userId} joined room ${parsedData.roomId}`);
        }
      }

      if (parsedData.type === "leave") {
        const user = users.find((x) => x.ws === ws);
        if (user) {
          user.rooms = user.rooms.filter((x) => x !== parsedData.room);
          console.log(`User ${userId} left room ${parsedData.room}`);
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

  ws.on("close", () => {
    const userIndex = users.findIndex(u => u.ws === ws);
    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      console.log(`User ${userId} disconnected. Total users: ${users.length}`);
    }
  });

  ws.on("error", (error) => {
    console.error(`WebSocket error for user ${userId}:`, error);
  });
});
