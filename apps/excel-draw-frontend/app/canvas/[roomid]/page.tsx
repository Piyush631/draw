import RoomCanvas from "@/app/component/roomCanvas";
import { BACKEND_URL } from "@/config";
import axios from "axios";

async function getRoomId(slug: string) {
  const response = await axios.get(`${BACKEND_URL}/room/${slug}`);
  return response.data.room.id;
}

export default async function GET({ params }: { params: Promise<{ roomid: string }> }) {
  const roomId = await getRoomId((await params).roomid);
  return <RoomCanvas id={roomId} />;
} 