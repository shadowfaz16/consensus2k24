// Blocks.tsx
import React, { useEffect } from "react";
import { BaseBlock, ChainStore } from "@/network/chain";
import useStore from "@/store/store";
import useBlockStore from "@/store/blockStore";

const Blocks = () => {
  const setUserGeneratedWallet = useStore((state) => state.setUserGeneratedWallet);
  const generatedUserWallet = useStore((state) => state.userGeneratedWallet);
  const setQrString = useStore((state) => state.setQrString);
  const blocks = useBlockStore((state) => state.blocks);
  const setBlocks = useBlockStore((state) => state.setBlocks);
  const setLastBlock = useBlockStore((state) => state.setLastBlock); // Ensure you have this setter in your store
  const { ethers } = require("ethers");

  useEffect(() => {
    const fetchAllBlocks = async () => {
      try {
        const allBlocks = await ChainStore.getAllBlocks();

        setBlocks(allBlocks);
        const genesisBlock = allBlocks.find(block => block.seq === 0);
        if (!genesisBlock) {
          throw new Error("No genesis block found");
        }

        const lastBlock = allBlocks[allBlocks.length - 1];
        setLastBlock(lastBlock);

        console.log("All Blocks:", allBlocks);
        console.log("Genesis Block:", genesisBlock);

        const digestArray = new Uint8Array(genesisBlock!.cid.multihash.digest);
        const addressBytes = digestArray.slice(0, 20);
        const addressHex = ethers.utils.hexlify(addressBytes);
        const checksumAddress = ethers.utils.getAddress(addressHex);
        setUserGeneratedWallet(checksumAddress);

        const qr = genesisBlock!.cid.toString();
        setQrString(qr);

        console.log("QR Code String:", qr);
        console.log("Generated Ethereum Address:", checksumAddress);
      } catch (error) {
        console.error("Failed to fetch blocks:", error);
      }
    };

    fetchAllBlocks();
  }, []);

  return (
    <div className="flex flex-col gap-6 my-2 bg-white p-7 rounded-lg shadow-lg w-full">
      <div className="border-none">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Blocks</h2>
        <p className="text-sm text-gray-500">
          This is the block explorer for your private chain
        </p>
        <p className="font-medium text-xs">Address: {generatedUserWallet}</p>
      </div>
      <div className="max-w-7xl mx-auto w-full mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-6 md:gap-4">
          {blocks.map((block, index) => (
            <React.Fragment key={index}>
              <div className="bg-white p-4 rounded-lg shadow-lg h-72 overflow-y-scroll gap-2 flex flex-col">
                <p className="font-medium text-sm">Block #: {index + 1}</p>
                <pre className="text-xs">{JSON.stringify(block, null, 2)}</pre>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}; 

export default Blocks;
