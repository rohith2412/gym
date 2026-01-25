import { Special_Gothic_Expanded_One } from "next/font/google";

import Background from "@/components/Background";
import LoginButton from "@/components/LoginButton";
import MainLogo from "@/components/MainLogo";

const specialGothic = Special_Gothic_Expanded_One({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div>
      <Background />
      {/* <MainLogo /> */}

      <div className={specialGothic.className}>
        <div className="grid justify-start text-6xl pt-15">
          <span>Lets</span>
          <span>Track</span>
          <span>Gym </span>
        </div>
      </div>

<div className="fixed bottom-0 left-0 w-full flex justify-center pb-6">
  <LoginButton />
</div>


    </div>
  );
}
