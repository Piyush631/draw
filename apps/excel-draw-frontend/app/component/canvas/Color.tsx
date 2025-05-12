export function Colors({
  activated,
  color,
  onClick,
}: {
  activated?: boolean;
  color: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={`h-6 w-6 cursor-pointer p-[2px] flex  ${activated ? "border-3 border-blue-950" : "text-white-400"} rounded-sm hover:border-1 hover:border-blue-400 `}
      onClick={onClick}
    >
      <div className={` w-10 rounded-sm ${color}`}></div>
    </div>
  );
}
