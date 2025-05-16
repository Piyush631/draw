import { WebSocket, WebSocketServer } from "ws";
import { client } from "@repo/database/db";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/common-backend/config";
const ws = new WebSocketServer({ port: 8090 });
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
    return decoded.userId;
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
    }
  });
});
