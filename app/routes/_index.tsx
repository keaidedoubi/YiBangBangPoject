import type { MetaFunction } from "@remix-run/node";
import { Clock, GitFork, Group, SendMail } from "iconoir-react";
import { BentoCard, BentoGrid } from "~/components/ui/BentoGrid";
import { Button, Calendar, Spacer } from "@heroui/react";
import { useNavigate } from "@remix-run/react";
import NavBar from "~/components/NavBar";
import { BoxReveal } from "~/components/ui/BoxReveal";
import Particles from "~/components/ui/Particles";
import { useEffect, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Dashboard" },
    { name: "description", content: "Welcome!" },
  ];
};

export default function Index() {
  const [color, setColor] = useState("#ffffff");
  useEffect(() => {
    setColor("#000000");
  }, []);
  const navigate = useNavigate();

  return(
    <div className="min-h-[780px] flex flex-col w-screen h-screen text-center">
      {/* <SideBar/> */}
      <NavBar isLogin={false} />
      <Spacer y={52}/>
      <Particles
        className="absolute inset-0"
        quantity={150}
        ease={80}
        color={color}
        refresh
      />
      <div className="mx-auto pt-0 w-full max-w-[40rem] items-center justify-center overflow-hidden">
        <BoxReveal boxColor={"#5046e6"} duration={0.5}>
          <p className="text-[3rem] font-semibold text-center">
          “易”帮帮AI学习社区<span className="text-[#5046e6]">.</span>
          </p>
        </BoxReveal>
        <BoxReveal boxColor={"#5046e6"} duration={0.5}>
          <h2 className="mt-[.5rem] text-[1rem]">
          使用
            <span className="font-semibold text-[#5046e6]">计算机技术</span> 
          助力校园信息化{" "}
          </h2>
        </BoxReveal>
        <BoxReveal boxColor={"#5046e6"} duration={0.5}>
          <div className="mt-[1.5rem]">
            <p>
            让AI赋能学习社区，共建信息化校园
              {/* <span className="font-semibold text-[#5046e6]"></span> */}<br />
            </p>
          </div>
        </BoxReveal>
        <BoxReveal boxColor={"#6056f6"} duration={0.5}>
          <div>
            <Button className="mt-[1.6rem] bg-[#6056f6]" onPress={()=>{ navigate('/report'); }}>
              <span className="text-[#ffffff]">易帮帮，启动！</span>
            </Button>
          </div>
        </BoxReveal>
      </div>
      {/* <div className="flex mx-auto px-auto mt-10 items-center justify-center">
        <BentoGrid className="h-full w-auto m-4">
          {features.map((feature) => (
            <BentoCard key={feature.name} {...feature} />
          ))}
        </BentoGrid>
      </div> */}
    </div>  
  );
}

