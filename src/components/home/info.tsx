import Image from "next/image";
import React from "react";
import info from "@/assets/static/info.webp";
import { AiOutlineDatabase } from "react-icons/ai";
import { VscClearAll } from "react-icons/vsc";
import { IoKeyOutline } from "react-icons/io5";
import { FaLock } from "react-icons/fa";
import { FaUnlock } from "react-icons/fa";

const Info = () => {
  return (
    <div className="container mx-auto space-y-24 py-24">
      <div className="space-y-6 text-center">
        <h1 className="text-4xl text-text-100">
          Embrace Transactional Freedom with Amendment 0
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-text-200">
          As users navigate digital landscapes, they generate valuable data.
          Traditionally, this data&apos;s equity is centralized with large
          vendors. Our POC changes this paradigm by capturing user actions—such
          as interactions on a social networking feed—within a personal
          blockchain, enabling users to retain and grow equity in their digital
          selves.
        </p>
      </div>
      <div className="flex items-center justify-around gap-48">
        <Image src={info} alt="hero" width={350} height={350} className="rounded-lg" />
        <div className="space-y-4">
          <h3 className="text-3xl text-text-100">
            Empowering Users with Decentralized Technology
          </h3>
          <p className="font-medium text-text-200">
            Under this innovative model, each user is granted a set of personal,
            fully decentralized blockchains. These are maintained and backed up
            using BitTorrent-like game mechanics by all stakeholders involved in
            an asset&apos;s state. Discoverability is facilitated through
            libp2p&apos;s Amino DHT, and synchronization employs a BitSwap-style
            protocol, akin to IPFS.
          </p>
        </div>
      </div>
      <div className="flex items-center justify-around gap-48">
        <div className="space-y-4">
          <h3 className="text-3xl text-text-100">
            Building on Rootstock for Seamless Integration
          </h3>
          <p className="font-medium text-text-200">
            For this project, we leveraged the Rootstock blockchain and its
            robust NFT ecosystem. Rootstock&apos;s developer-friendly
            environment allowed us to achieve an NFT transaction from a browser
            tab swiftly, highlighting its capability to handle our unique
            project&apos;s demands. Next, we aim to utilize Rootstock to
            facilitate private equity sales of NFTs using their BTC products.
          </p>
        </div>
        <div className="w-full space-y-8">
          <div className="flex items-center space-x-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-bg-300">
              <div className="h-10 w-10 rounded-md bg-primary-200 flex items-center justify-center">
                <AiOutlineDatabase className="text-text-100" size={18} />
              </div>
            </div>
            <p className="text-lg font-medium text-text-100">
              Decentralized Personal Blockchains
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-bg-300">
              <div className="h-10 w-10 rounded-md bg-primary-200 flex items-center justify-center">
                <VscClearAll className="text-text-100" size={18} />
              </div>
            </div>
            <p className="text-lg font-medium text-text-100">
              Direct Browser-to-Browser NFT Transfers
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-bg-300">
              <div className="h-10 w-10 rounded-md bg-primary-200 flex items-center justify-center">
                <IoKeyOutline className="text-text-100" size={18} />
              </div>
            </div>
            <p className="text-lg font-medium text-text-100">
              Leveraging Rootstock&apos;s Strengths
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-32 pt-8">
        <div className="flex flex-col justify-center w-full items-center space-y-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-md bg-bg-300">
            <div className="h-16 w-16 rounded-md bg-primary-200 flex items-center justify-center">
              <FaLock className="text-text-100" size={24} />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h4 className="text-2xl font-semibold text-accent-100">
              Innovative Data Security
            </h4>
            <p className="text-text-200">
              Protect your digital actions with decentralized, user-specific
              blockchains that offer unmatched security and equity.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center w-full items-center space-y-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-md bg-bg-300">
            <div className="h-16 w-16 rounded-md bg-primary-200 flex items-center justify-center">
              <FaUnlock className="text-text-100" size={24} />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h4 className="text-2xl font-semibold text-primary-200">
              Next-Gen Digital Marketplace
            </h4>
            <p className="text-text-200">
              Participate in a cutting-edge, fully peer-to-peer marketplace that
              eliminates the need for centralized servers, bringing
              transactional freedom to the forefront.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
