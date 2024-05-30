import Image from "next/image";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import Connectbutton from "@/components/thirdweb/ConnectButton";
import Balance from "@/components/thirdweb/BalanceOf"
import NavBar from "@/components/navbar";
import Hero from "@/components/home/hero";
import { ReactElement } from "react";
import Layout from "@/components/layout";

const inter = Inter({ subsets: ["latin"] });

const Home = () => {
  return (
    <div className=" flex flex-col items-center justify-center bg-gray-100 p-4">
    <Hero />
    </div>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
      {page}
    </Layout>
  );
}

export default Home;