import React from "react";

function Tile({ letter, color }) {
  const bg =
    color === "green"
      ? "bg-green-500"
      : color === "orange"
      ? "bg-orange-400"
      : "bg-gray-400";

  return <div className={`w-10 h-10 flex items-center justify-center text-white font-bold ${bg}`}>{letter}</div>;
}

export default Tile;
