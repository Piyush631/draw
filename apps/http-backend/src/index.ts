import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { authMiddleWare } from "./middleware/authMiddle";
import { client } from "@repo/database/db";
import {
  roomValidation,
  signinValidation,
  signupValidation,
} from "@repo/common-validation/validation";
import cors from "cors";
import { JWT_SECRET } from "@repo/common-backend/config";
import { sendEmail } from "./utils/email";

const app = express();
app.use(express.json());
app.use(cors());
app.post("/signup", async (req, res) => {
  const parsedData = signupValidation.safeParse(req.body);
  console.log(req.body);
  if (!parsedData.success) {
    res.status(400).json({
      msg: parsedData.error,
    });
    console.log(parsedData);
    return;
  }
  console.log(parsedData.data)
  const hashedPassword = await bcrypt.hash(parsedData.data.password, 5);
  console.log(hashedPassword);
  try {
    const data = await client.user.create({
      data: {
        email: parsedData.data.email,
        name: parsedData.data.name,
        password: hashedPassword,
      },
    });
    console.log(data)
    res.status(201).json({
      msg: "User created successfully",
      user: {
        id: data.id,
        email: data.email,
        name: data.name
      }
    });
    return;
  } catch (error) {
    console.log(error)
    res.status(500).json({
      msg: "Internal server error",
    });
    return;
  }
});
app.post("/signin", async (req, res) => {
  const parsedData = signinValidation.safeParse(req.body);
  if (!parsedData.success) {
    res.json({
      msg: parsedData.error,
    });
    return;
  }

  try {
    const user = await client.user.findFirst({
      where: {
        email: parsedData.data.email,
      },
    });
    if (!user) {
      res.json({
        msg: "username not found",
      });
    }
console.log("hi",user)
    //@ts-ignore
    const passwordmatch = await bcrypt.compare(
      parsedData.data.password,
      //@ts-ignore
      user.password
    );
    console.log("hi",passwordmatch)
    if (!passwordmatch) {
      res.status(401).json({
        msg: "Incorrect password",
        error: "Authentication failed - invalid password"
      });
      return;
    }
console.log("hi",user?.id)
console.log("hi",JWT_SECRET)
    const token = jwt.sign(
      {
        userId: user?.id,
      },
      JWT_SECRET
    );
    console.log("hi",token)

    res.json({
      token,
    });
  } catch (error) {
    res.json({
      msg: "user is not exist please signup first",
    });
  }
});
app.post("/room", authMiddleWare, async (req, res) => {
  const parsedData = roomValidation.safeParse(req.body);
  console.log(req.body);

  if (!parsedData.success) {
    res.json({
      msg: parsedData.error,
    });
    return;
  }
  //@ts-ignore
  const userId = req.userId;

  try {
    const room = await client.room.create({
      data: {
        slug: parsedData.data.slug,
        admin_id: userId,
      },
    });
    console.log(room);
    res.json({
      msg: "success",
    });
  } catch (error) {
    res.json({
      msg: "failed",
    });
  }
});
app.get("/chats/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);
  try {
    const messages = await client.chat.findMany({
      where: {
        roomid: roomId,
      },
      orderBy: {
        id: "desc",
      },
      take: 1000,
    });
    res.json({
      messages,
    });
  } catch (e) {
    res.json({
      messages: [],
    });
  }
});

app.get("/room/:slug", async (req, res) => {
  const slug = req.params.slug;
  try {
    const room = await client.room.findFirst({
      where: {
        slug: slug,
      },
    });
    res.json({
      room,
    });
  } catch (e) {
    res.json({
      msg: "No room found",
    });
  }
});
app.get("/all/rooms", async (req, res) => {
  try {
    const rooms = await client.room.findMany({});
    res.json({
      rooms,
    });
  } catch (e) {
    res.json({
      msg: "error",
    });
  }
});

app.post("/email-login", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await client.user.findFirst({
      where: {
        email: email,
      },
    });
    if (!user) {
      res.json({
        msg: "user not found",
      });
      return;
    }
    if (user) {
      const response = await sendEmail(email);
      if (response.success === true) {
        res.json({
          msg: response.success,
        });
        return;
      }
      if (response.success === false) {
        res.json({
          msg: response.success,
        });
      }
    }
  } catch (error) {
    res.json({
      error,
    });
  }
});
app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await client.otp.findFirst({
      where: {
        email: email,
        otp: otp,
      },
    });

    if (!user) {
      res.json({
        msg: "Invalid OTP",
      });
      return;
    }

    if (user.expired_At <= new Date()) {
      res.json({
        msg: "otp expired",
      });
      return;
    }
    if (user.otp !== otp) {
      res.json({
        msg: "invalid otp",
      });
      return;
    }
    const token = jwt.sign(
      {
        userId: user.id,
      },
      JWT_SECRET
    );

    res.json({
      token,
    });
  } catch (error) {
    res.status(500).json({
      msg: "Error verifying OTP",
    });
  }
});

app.delete("/room/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await client.chat.deleteMany({
      where: {
        roomid: Number(id),
      },
    });

    await client.room.delete({
      where: {
        id: Number(id),
      },
    });

    res.json({
      msg: "room delete successfully",
    });
    return;
  } catch (error) {
    res.json({
      msg: "room is not deleted",
    });
    return;
  }
});

app.listen(4004);
