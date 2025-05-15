import { WebSocket, WebSocketServer } from "ws";
import { client } from "@repo/database/db";
import * as jwt from "jsonwebtoken";
import { JWT_SECRET, WS_PORT } from "@repo/common-backend/config";
const ws = new WebSocketServer({ port: Number(WS_PORT) });
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
    console.log(decoded.userId);
    if (!decoded || !decoded.userId) {
      return null;
    }
    // Ensure userId is always a string
    return String(decoded.userId);
  } catch (e) {
    return null;
  }
}
ws.on("connection", function connection(ws, request) {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryparams = new URLSearchParams(url.split("?")[1]);
  const token = queryparams.get("token") || "";
  const userId = checkuser(token);
  if (userId === null) {
    ws.close();
    return null;
  }
  console.log(userId);
  users.push({
    userId,
    rooms: [],
    ws,
  });

  ws.on("message", async function message(data) {
    let parsedData;

    if (typeof data !== "string") {
      parsedData = JSON.parse(data.toString());
    } else {
      parsedData = JSON.parse(data);
    }
    if (parsedData.type === "join") {
      const user = users.find((x) => x.ws === ws);

      user?.rooms.push(parsedData.roomId);
    }
    if (parsedData.type === "leave") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user?.rooms.filter((x) => x === parsedData.room);
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
      console.log("userId");
      console.log(userId);
      console.log(roomId);
      console.log(message);
      console.log(id);
      try {
        // First verify the user exists
        const user = await client.user.findUnique({
          where: {
            id: String(userId) // Ensure userId is a string
          }
        });

        if (!user) {
          ws.send(JSON.stringify({
            type: "error",
            message: "User not found"
          }));
          return;
        }

        // Create the chat message
        await client.chat.create({
          data: {
            id: id,
            roomid: Number(roomId),
            message,
            userid: String(userId), // Ensure userId is a string
          },
        });

        // Broadcast to all users in the room
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
  });
});
