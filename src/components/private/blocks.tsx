import useNetwork from "@/hooks/useNetwork";
import { BaseBlock, ChainStore } from "@/network/chain";
import { keys as libp2pKeys } from "@libp2p/crypto";
import React, { useEffect } from "react";
import useStore from "@/store/store";

const Blocks = () => {
  const { privateKey, publicKey } = useNetwork();
  const setUserGeneratedWallet = useStore(
    (state) => state.setUserGeneratedWallet
  );
  const generatedUserWallet = useStore((state) => state.userGeneratedWallet);
  const setQrString = useStore((state) => state.setQrString);
  const [blocks, setBlocks] = React.useState<BaseBlock[]>([]);
  const { ethers } = require("ethers");

  const handleInitializeChainStore = async () => {
    try {
      const private_key = await libp2pKeys.unmarshalPrivateKey(privateKey);
      const key = await libp2pKeys.unmarshalPublicKey(publicKey);

      console.log("Private Key in function:", private_key);
      console.log("Public Key in function:", key);

      if (!private_key || !key) {
        console.error("Public or private key is missing.");
        return;
      }

      const block1 = await ChainStore.create(
        null,
        { type: "Genesis", key },
        private_key
      );

      setBlocks([block1]);
      console.log("First block CID:", block1.cid);
      console.log("First block CID QR CODE:", block1.cid.toString());
      console.log("Block1 digest: ", block1.cid.multihash.digest);

      const qrCode = block1.cid.toString();

      // Extract the digest from block1.cid.multihash.digest
      const digestArray = new Uint8Array(block1.cid.multihash.digest);

      // Take the first 20 bytes of the digest to form the address
      const addressBytes = digestArray.slice(0, 20);
      const addressHex = ethers.utils.hexlify(addressBytes);

      // Convert to a checksummed Ethereum address
      const checksumAddress = ethers.utils.getAddress(addressHex);
      setUserGeneratedWallet(checksumAddress);

      // Set the QR code string
      setQrString(qrCode);
      console.log("QR Code String:", qrCode);

      console.log("Generated Ethereum Address:", checksumAddress);
    } catch (error) {
      console.error("Error initializing ChainStore:", error);
    }
  };

  useEffect(() => {
    handleInitializeChainStore();
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
          {blocks.map((block, index) => (
            <React.Fragment key={index}>
              <div className="bg-white p-4 rounded-lg shadow-lg h-72 overflow-y-scroll gap-2 flex flex-col">
                <p className="font-medium text-sm">Block #: {block.seq}</p>
                <p className="font-medium text-xs">
                  toypeof: {typeof block.cid.multihash.digest}
                </p>
                {/* <p className="font-medium">Block #: {index}</p> */}
                <pre className="text-xs">{JSON.stringify(block, null, 2)}</pre>
              </div>
              {index < blocks.length - 1 && (
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
