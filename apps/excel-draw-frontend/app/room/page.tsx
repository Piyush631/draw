"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BACKEND_URL } from "@/config";
import axios from "axios";

interface Room {
  id: string;
  name: string;
  // Add other room properties as needed
}

export default function Room() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }

    const fetchRooms = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/room`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRooms(response.data.rooms);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-black">
        <div className="h-full w-full flex justify-center items-center">
          <Image 
            src="/1494.gif" 
            alt="Loading animation"
            width={200}
            height={200}
            className="w-auto h-auto"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Rooms</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => router.push(`/canvas/${room.id}`)}
            >
              <h2 className="text-xl font-semibold mb-2">{room.name}</h2>
              <p className="text-gray-400">Click to join</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
