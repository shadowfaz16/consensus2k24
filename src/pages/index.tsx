import Image from "next/image";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import Connectbutton from "@/components/thirdweb/ConnectButton";
import Balance from "@/components/thirdweb/BalanceOf";
import NavBar from "@/components/navbar";
import Hero from "@/components/home/hero";
import { ReactElement, useEffect } from "react";
import Layout from "@/components/layout";
import { Network } from "@/network";
import useStore from "@/store/store";
import useNetwork from "@/hooks/useNetwork";

const inter = Inter({ subsets: ["latin"] });

// (async () => {
//   let network = new Network();
//   console.log("starting network");
//   await network.init();
//   console.log("started network");
// })();

const Home = () => {

  const { loading, peerId } = useNetwork();

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-4">
    
        <>
          <Hero />
          {/* {loading ? (
        <>
        <div className="w-48 h-48 bg-gray-500 animate-pulse"></div>
        <p>
        Loading...
        </p>
        </>
      ) : (
          <p>Peer ID: {peerId}</p>
          )} */}
        </>

    </div>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Home;
