import type { MetaFunction } from "@remix-run/node";
import { Outlet, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Chat" },
    { name: "description", content: "Chat" },
  ];
};


export default function Chat(){
  const [color, setColor] = useState("#ffffff");
  useEffect(() => {
    setColor("#000000");
  }, []);
  const navigate = useNavigate();

  return(
    <div>
      <Outlet/>
    </div>
  );
}