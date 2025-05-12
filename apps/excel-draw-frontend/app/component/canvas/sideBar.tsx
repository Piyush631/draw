import { Stroke, Fill, Width, Dots } from "../canvas";
import { Colors } from "./Color";

export function SideBar({
  selectedStroke,
  setSelectedStroke,
  selectedFill,
  setSelectedFill,
  selectedWidth,
  setSelectedWidth,
  selectedStyle,
  setSelectedStyle,
}: {
  selectedStroke: Stroke;
  setSelectedStroke: (s: Stroke) => void;
  selectedFill: Fill;
  setSelectedFill: (f: Fill) => void;
  selectedWidth: Width;
  setSelectedWidth: (w: Width) => void;
  selectedStyle: Dots;
  setSelectedStyle: (d: Dots) => void;
}) {
  return (
    <div className="absolute h-auto w-44 top-30 left-0 right-0 ">
      <div className="px-2  pb-3 pt-3 h-full  text-white gap-6  w-full rounded-r-lg flex flex-col bg-neutral-800">
        <div>
          <div className="text-sm ">Stroke</div>
          <div className="flex  pt-2 gap-1 mt-1 ">
            <Colors
              onClick={() => {
                setSelectedStroke("black");
              }}
              activated={selectedStroke === "black"}
              color={"bg-black"}
            />

            <Colors
              onClick={() => {
                setSelectedStroke("red");
              }}
              activated={selectedStroke === "red"}
              color={"bg-red-700"}
            />
            <Colors
              onClick={() => {
                setSelectedStroke("green");
              }}
              activated={selectedStroke === "green"}
              color={"bg-green-700"}
            />

            <Colors
              onClick={() => {
                setSelectedStroke("white");
              }}
              activated={selectedStroke === "white"}
              color={"bg-gray-200"}
            />
            <Colors
              onClick={() => {
                setSelectedStroke("blue");
              }}
              activated={selectedStroke === "blue"}
              color={"bg-blue-700"}
            />
          </div>
        </div>
        <div>
          <div className="text-sm ">Background</div>
          <div className="flex pt-2 gap-1 mt-1 ">
            <Colors
              onClick={() => {
                setSelectedFill("black");
              }}
              activated={selectedFill === "black"}
              color={"bg-black"}
            />
            <Colors
              onClick={() => {
                setSelectedFill("#FFC9C9");
              }}
              activated={selectedFill === "#FFC9C9"}
              color={"bg-[#FFC9C9]"}
            />
            <Colors
              onClick={() => {
                setSelectedFill("#B2F2BB");
              }}
              activated={selectedFill === "#B2F2BB"}
              color={"bg-[#B2F2BB]"}
            />

            <Colors
              onClick={() => {
                setSelectedFill("white");
              }}
              activated={selectedFill === "white"}
              color={"bg-gray-200"}
            />
            <Colors
              onClick={() => {
                setSelectedFill("#FFEC99");
              }}
              activated={selectedFill === "#FFEC99"}
              color={"bg-[#FFEC99]"}
            />
          </div>
        </div>

        <div>
          <div className="text-sm "> Stroke Width</div>
          <div className="flex  items-center pt-2  gap-3 mt-1 ">
            <div
              onClick={() => {
                setSelectedWidth(1);
              }}
              className={`h-3 w-10 flex justify-center items-center cursor-pointer    hover:border-1 hover:border-black   ${selectedWidth === 1 && " bg-blue-400"}  `}
            >
              <div className="h-[1px] w-2/3 cursor-pointer bg-white"></div>
            </div>
            <div
              onClick={() => {
                setSelectedWidth(3);
              }}
              className={`h-4 w-10 flex justify-center items-center cursor-pointer    hover:border-1 hover:border-black   ${selectedWidth === 3 && " bg-blue-400"}  `}
            >
              <div className="h-[2px] w-2/3 cursor-pointer bg-white"></div>
            </div>
            <div
              onClick={() => {
                setSelectedWidth(6);
              }}
              className={`h-4 w-10 flex justify-center items-center cursor-pointer    hover:border-1 hover:border-black   ${selectedWidth === 6 && " bg-blue-400"}  `}
            >
              <div className="h-[3px] w-2/3 cursor-pointer bg-white"></div>
            </div>
          </div>
        </div>
        <div>
          <div className="text-sm "> Stroke Style</div>
          <div className="flex pt-2  gap-4 mt-1 ">
            <div
              onClick={() => {
                setSelectedStyle("solid");
              }}
              className={`h-3 w-10 flex justify-center items-center cursor-pointer    hover:border-1 hover:border-black   ${selectedStyle === "solid" && " bg-blue-400"}  `}
            >
              <div className="h-[1px] w-2/3 cursor-pointer bg-white"></div>
            </div>
            <div
              onClick={() => {
                setSelectedStyle("dotted");
              }}
              className={`  flex  items-center cursor-pointer w-10 justify-center  gap-[1px] ${selectedStyle === "dotted" && "bg-blue-400"}  hover:border-1 hover:border-black`}
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="h-[1.5px] w-1  bg-white" key={index}></div>
              ))}
            </div>
            <div
              onClick={() => {
                setSelectedStyle("dashed");
              }}
              className={` w-11   cursor-pointer ${selectedStyle === "dashed" && "bg-blue-400"} flex justify-center items-center  gap-[1px] hover:border-1 hover:border-black `}
            >
              {Array.from({ length: 7 }).map((_, index) => (
                <div className="h-[2.5px] w-3  bg-white" key={index}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
