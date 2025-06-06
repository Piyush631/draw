import { useRouter } from "next/navigation";
import { Tool } from "../canvas";
import { Icons } from "./Icons";
import { BiRectangle } from "react-icons/bi";
import { FaRegCircle } from "react-icons/fa";
import { GoPencil } from "react-icons/go";
import { CiText } from "react-icons/ci";
import { PiDiamond } from "react-icons/pi";
import { TbLogout } from "react-icons/tb";
import { GoArrowRight } from "react-icons/go";
import { BsEraser } from "react-icons/bs";
import { FiMinus } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import axios from "axios";
import { BACKEND_URL } from "@/config";

export function TopBar({
  selectedTool,
  setSelectedTool,
  id,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
  id: string;
}) {
  const router = useRouter();
  function Logout() {
    router.push("/room");
  }
  async function deleteRoom() {
    try {
      const response = await axios.delete(`${BACKEND_URL}/room/${id}`);
      if (response) {
        router.push("/room");
      }
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <div className=" absolute   top-3 w-full  flex gap-3 items-center justify-center">
      <div className="flex bg-neutral-800 text-white md:gap-4 gap-3 px-6 py-[6px] rounded-xl justify-center">
        <div className="h-9 w-10 rounded-lg flex cursor-pointer items-center bg-neutral-800 hover:bg-blue-100 justify-center  ">
          <Icons
            onClick={() => {
              setSelectedTool("rect");
            }}
            icon={<BiRectangle />}
            activated={selectedTool === "rect"}
            id={"1"}
          />
        </div>
        <div className="h-9 w-10 rounded-lg flex cursor-pointer items-center bg-neutral-800 hover:bg-blue-100 justify-center  ">
          <Icons
            onClick={() => {
              setSelectedTool("circle");
            }}
            icon={<FaRegCircle />}
            activated={selectedTool === "circle"}
            id={"2"}
          />
        </div>
        <div className="h-9 w-10 rounded-lg flex cursor-pointer items-center bg-neutral-800 hover:bg-blue-100 justify-center  ">
          <Icons
            onClick={() => {
              setSelectedTool("diamond");
            }}
            icon={<PiDiamond />}
            activated={selectedTool === "diamond"}
            id={"3"}
          />
        </div>
        <div className="  h-9 w-10 text-gray-600 rounded-lg  cursor-pointer items-center bg-neutral-800 hover:bg-blue-100 justify-center  ">
          <Icons
            onClick={() => {
              setSelectedTool("rightArrow");
            }}
            icon={<GoArrowRight />}
            activated={selectedTool === "rightArrow"}
            id={"4"}
          />
        </div>
        <div className="h-9 w-10 rounded-lg  cursor-pointer flex items-center bg-neutral-800 hover:bg-blue-100 justify-center  ">
          <Icons
            onClick={() => {
              setSelectedTool("line");
            }}
            icon={<FiMinus />}
            activated={selectedTool === "line"}
            id={"4"}
          />
        </div>

        <div className="h-9 w-10 rounded-lg cursor-pointer flex items-center bg-neutral-800 hover:bg-blue-100 justify-center  ">
          <Icons
            onClick={() => {
              setSelectedTool("text");
            }}
            icon={<CiText />}
            activated={selectedTool === "text"}
            id={"5"}
          />
        </div>

        <div className="h-9 w-10 rounded-lg cursor-pointer flex items-center bg-neutral-800 hover:bg-blue-100 justify-center  ">
          <Icons
            onClick={() => {
              setSelectedTool("pencil");
            }}
            icon={<GoPencil />}
            activated={selectedTool === "pencil"}
            id={"6"}
          />
        </div>
        <div className="h-9 w-10 rounded-lg cursor-pointer flex items-center bg-neutral-800 hover:bg-blue-100 justify-center  ">
          <Icons
            onClick={() => {
              setSelectedTool("eraser");
            }}
            icon={<BsEraser />}
            activated={selectedTool === "eraser"}
            id={"0"}
          />
        </div>
        <div
          onClick={deleteRoom}
          className="h-9 w-10 text-white rounded-lg cursor-pointer flex items-center bg-neutral-800 hover:bg-blue-100 justify-center  "
        >
          <span className="text-2xl text-white">
            {" "}
            <RiDeleteBinLine />{" "}
          </span>
        </div>
        <div
          onClick={Logout}
          className="h-9 w-10 text-white rounded-lg cursor-pointer flex items-center bg-neutral-800 hover:bg-blue-100 justify-center  "
        >
          <span className="text-2xl text-white">
            {" "}
            <TbLogout />{" "}
          </span>
        </div>
      </div>
    </div>
  );
}
