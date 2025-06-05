"use client";

import { BACKEND_URL } from "@/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaSquarePlus, FaArrowRightLong } from "react-icons/fa6";
import { IoPeopleSharp, IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import { FaRegCopy } from "react-icons/fa";
import { GoPencil } from "react-icons/go";
import { RiDeleteBinLine } from "react-icons/ri";


interface RoomData {
  slug: string;
  created_at: string;
  id: number;
}

export default function Room() {
  const router = useRouter();
  const [createRoom, setCreateRoom] = useState(false);
  const [joinRoom, setJoinRoom] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [allData, setAllData] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(false);
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/signin");
    }
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    router.push("/signin");
  }

  function EnterRoom() {
    router.push(`canvas/${roomName}`);
  }

  async function deleteRoom(id: number) {
    try {
      const response = await axios.delete(`${BACKEND_URL}/room/${id}`);
      if (response) {
        fetchData();
        router.push("/room");
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function CreateRoom() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/signin");
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/room`,
        { slug },
        {
          headers: {
            authorization: token,
          },
        }
      );

      if (response.data.msg === "success") {
        setCreateRoom(false);
        setSlug(""); 
        fetchData(); 
      } else {
        toast.error("Room already exists!");
      }
    } catch (err) {
      
    }
  }

  useEffect(() => {
    fetchData();
  }, [createRoom]);

  async function fetchData() {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/all/rooms`);
      setAllData(response.data.rooms);
    } catch (err) {
      console.error("Error fetching data", err);
    }
    setLoading(false);
  }

  return (
    <div>
      <div className={`${createRoom || joinRoom ? "blur-xs" : ""}`}>
        {/* Header */}
        <div className="border-b-1 h-16 flex items-center justify-between lg:px-24 md:px-16 px-6 rounded-b-3xl border-gray-200">
          <div
            onClick={() => router.push("/")}
            className="font-semibold cursor-pointer text-xl flex gap-1 justify-center"
          >
            <div className="pt-1 font-semibold text-xl">
              <GoPencil />
            </div>
            <div>CoCreate</div>
          </div>
          <button
            onClick={logout}
            className="cursor-pointer bg-black text-white hover:bg-white hover:text-black rounded-2xl h-8 px-3"
          >
            Logout
          </button>
        </div>

        {/* Create / Join Cards */}
        <div className="flex md:flex-row flex-col gap-7 lg:px-24 md:px-16 px-6 pt-12">
          {[{ label: "Create", icon: <FaSquarePlus />, setter: setCreateRoom }, { label: "Join", icon: <IoPeopleSharp />, setter: setJoinRoom }].map((item) => (
            <div
              key={item.label}
              onClick={() => item.setter(true)}
              className="h-52 group bg-gray-100 hover:border-2 hover:shadow-gray-400 hover:shadow-xl border-black cursor-pointer rounded-2xl flex flex-col p-5 justify-around lg:w-3/4 w-full"
            >
              <div className="text-5xl group-hover:rotate-12 w-14">{item.icon}</div>
              <div className="text-xl font-semibold">{item.label} Room</div>
              <div className="text-gray-500">
                Start a new chat room and invite others to join. Set your own room rules and preferences.
              </div>
            </div>
          ))}
        </div>

        {/* Recent Rooms */}
        <div className="pt-4 mt-8 lg:px-24 md:px-16 px-6">
          <div className="flex flex-col p-4 bg-gray-100 gap-2 rounded-xl">
            <div className="text-2xl font-semibold">Recent Rooms</div>
            <div className="border-t-1 font-semibold text-center border-gray-300 py-3 flex justify-between">
              <div>Room Name</div>
              <div>Creation Date</div>
              <div>Action</div>
            </div>
            {loading ? (
              <div className="flex justify-center">
                <img src="/1495.gif" alt="Loading" width={96} height={96} />
              </div>
            ) : (
              allData.map((m) => (
                <div
                  key={m.slug}
                  className="flex justify-between text-center border-t-1 py-3 border-gray-300"
                >
                  <div className="flex gap-1 items-center justify-center">
                    <div>{m.slug}</div>
                    <div onClick={() => deleteRoom(m.id)} className="cursor-pointer">
                      <RiDeleteBinLine />
                    </div>
                    <div className="text-gray-400 hidden">
                      <FaRegCopy />
                    </div>
                  </div>
                  <div className="pl-6">{m.created_at.slice(0, 10)}</div>
                  <div
                    onClick={() => router.push(`canvas/${m.slug}`)}
                    className="flex gap-1 items-center justify-center px-3 cursor-pointer py-2 hover:bg-black hover:text-white hover:rounded-2xl"
                  >
                    <button className="cursor-pointer">Join</button>
                    <FaArrowRightLong />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      {createRoom && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setCreateRoom(false)}></div>
          <div className="relative bg-white px-5 py-4 rounded-2xl w-full max-w-md mx-4">
            <div className="text-3xl flex justify-end">
              <span onClick={() => setCreateRoom(false)} className="cursor-pointer">
                <IoClose />
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xl font-semibold">Create Room</div>
              <div className="text-gray-500">Enter Room Name</div>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="py-2 px-2 border-1 border-gray-500 rounded-xl w-full"
                type="text"
                placeholder="Enter Room Name"
              />
              <div className="flex justify-center pt-2">
                <button onClick={CreateRoom} className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {joinRoom && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setJoinRoom(false)}></div>
          <div className="relative bg-white px-5 py-4 rounded-2xl w-full max-w-md mx-4">
            <div className="text-3xl flex justify-end">
              <span onClick={() => setJoinRoom(false)} className="cursor-pointer">
                <IoClose />
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-xl font-semibold">Join Room</div>
              <div className="text-gray-500">Enter Room Name</div>
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="py-2 px-2 border-1 border-gray-500 rounded-xl w-full"
                type="text"
                placeholder="Enter Room Name"
              />
              <div className="flex justify-center pt-2">
                <button onClick={EnterRoom} className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
