import { WebSocket, WebSocketServer } from "ws";
import { client } from "@repo/database/db";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/common-backend/config";

const PORT =  8090;

const ws = new WebSocketServer({ 
  port: Number(PORT),
  perMessageDeflate: false,
  clientTracking: true
});

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
    if (typeof decoded === "string") {
      return null;
    }
    if (!decoded || !decoded.userId) {
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
  users.push({
    userId,
    rooms: [],
    ws,
  });


  ws.send(JSON.stringify({
    type: "connection",
    status: "connected",
    userId
  }));

  ws.on("message", async function message(data) {
    try {
      let parsedData;
      if (typeof data !== "string") {
        parsedData = JSON.parse(data.toString());
      } else {
        parsedData = JSON.parse(data);
      }

      console.log("Received message:", parsedData.type);

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
      }

      if (parsedData.type === "chat") {
        const roomId = parsedData.roomId;
        const message = parsedData.message;
        const id = parsedData.id;

        try {
          const user = await client.user.findUnique({
            where: {
              id: String(userId)
            }
          });

          if (!user) {
            ws.send(JSON.stringify({
              type: "error",
              message: "User not found"
            }));
            return;
          }

          await client.chat.create({
            data: {
              id: id,
              roomid: Number(roomId),
              message,
              userid: String(userId),
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
          ws.send(JSON.stringify({
            type: "error",
            message: "Failed to send message"
          }));
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(JSON.stringify({
        type: "error",
        message: "Failed to process message"
      }));
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