import { ReactNode } from "react";

export function Icons({
  icon,
  activated,
  id,
  onClick,
}: {
  icon: ReactNode;
  activated?: boolean;
  id?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`  flex justify-center text-white  items-center h-9 w-10 rounded-lg  ${activated ? "bg-blue-500" : "text-white-400"}`}
      onClick={onClick}
    >
      <div className="text-xl"> {icon}</div>
      <div className="text-[10px] text-white pt-3 ">{id}</div>
    </div>
  );
}
