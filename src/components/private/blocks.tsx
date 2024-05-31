import useNetwork from "@/hooks/useNetwork";
import { BaseBlock, ChainStore } from "@/network/chain";
import { keys as libp2pKeys } from "@libp2p/crypto";
import React, { useEffect } from "react";
import useStore from "@/store/store";

const Blocks = () => {
  const setUserGeneratedWallet = useStore(
    (state) => state.setUserGeneratedWallet
  );
  const generatedUserWallet = useStore((state) => state.userGeneratedWallet);
  const setQrString = useStore((state) => state.setQrString);
  const [blockChain, setBlockChiain] = React.useState<any[]>([]);
  const { ethers } = require("ethers");
  

  useEffect(() => {
    const fetchGenesisBlock = async () => {
      try {
        const genesisBlock = await ChainStore.genesis();
        const blocks = await ChainStore.roots();
        setBlockChiain(blocks || []);
        console.log("Genesis Block by Will:", genesisBlock);
        console.log("Blocks by Will:", blocks);

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
        console.error("Failed to fetch genesis block:", error);
      }
    };

    fetchGenesisBlock();
  }, []);

  return (
    <div className="flex flex-col gap-6 my-2 bg-white p-7 rounded-lg shadow-lg w-full">
      <div className="">
        <h2 className="text-xl font-semibold text-gray-800 mb-1">Blocks</h2>
        <p className="text-sm text-gray-500">
          This is the block explorer for your private chain
        </p>
        <p className="font-medium text-xs">Address: {generatedUserWallet}</p>
      </div>
      {/* <button
        onClick={handleInitializeChainStore}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Initialize ChainStore
      </button> */}
      <div className="max-w-7xl mx-auto w-full mt-4">
        <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-6 md:gap-1">
          {blockChain.map((block, index) => (
            <React.Fragment key={index}>
              <div className="bg-white p-4 rounded-lg shadow-lg h-72 overflow-y-scroll gap-2 flex flex-col">
                <p className="font-medium text-sm">Block #: {block.seq}</p>
                {/* <p className="font-medium">Block #: {index}</p> */}
                <pre className="text-xs">{JSON.stringify(block, null, 2)}</pre>
              </div>
              {index < blockChain.length - 1 && (
                <hr className="border-t-2 border-gray-400 h-2 w-24 hidden md:flex" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blocks;
