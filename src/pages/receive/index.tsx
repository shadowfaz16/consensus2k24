import React, { useState } from "react";
import QRCodeGenerator from "@/components/qr/QrGenerator";
import Layout from "@/components/layout";
import { FaRegUserCircle, FaEye, FaRegEyeSlash } from "react-icons/fa";
import useStore from "@/store/store";
import useNetwork from "@/hooks/useNetwork";
import { bytesToHex, bytesToBase64 } from "@/ultils/utils";
import Table from "@/components/history/table";
import FetchNfts from "@/components/nfts/fetch-nfts";
import { BaseBlock, ChainStore, GenesisBlock } from "../../network/chain";
import { keys as libp2pKeys } from "@libp2p/crypto";
import { ethers } from "ethers";
import SendNFT from "@/components/nfts/send-nfts";
import OffChainNFTs from "@/components/nfts/off-chain-nfts";
import ImageUploader from "@/components/image/image-fetch";

const Profile = () => {
  const { loading, peerId, privateKey, publicKey, peerNumber } = useNetwork();
  const [showQr, setShowQr] = React.useState(false);
  const [blocks, setBlocks] = React.useState<BaseBlock[]>([]);
  const { ethers } = require("ethers");


  let userGeneratedWallet;

  const handleInitializeChainStore = async () => {
    console.log("Button clicked, initializing ChainStore...");
    try {
      const private_key = await libp2pKeys.unmarshalPrivateKey(privateKey);
      const key = await libp2pKeys.unmarshalPublicKey(publicKey);

      console.log("Private Key in function:", private_key);
      console.log("Public Key in function:", key);

      if (!private_key || !key) {
        console.error("Public or private key is missing.");
        return;
      }

      const block1 = await ChainStore.create(null, { key }, private_key);

      setBlocks([block1]);
      console.log("Blocks:", [block1]);
      console.log("Block1 digest: ", block1.cid.multihash.digest);

      // Extract the digest from block1.cid.multihash.digest
      const digestArray = new Uint8Array(block1.cid.multihash.digest);

      // Take the first 20 bytes of the digest to form the address
      const addressBytes = digestArray.slice(0, 20);
      const addressHex = ethers.utils.hexlify(addressBytes);

      // Convert to a checksummed Ethereum address
      const checksumAddress = ethers.utils.getAddress(addressHex);
      userGeneratedWallet = checksumAddress;

      console.log("Generated Ethereum Address:", checksumAddress);
    } catch (error) {
      console.error("Error initializing ChainStore:", error);
    }
  };

  return (
    <div className="min-h-[92dvh] flex flex-col items-center bg-gray-100 p-4 gap-4 pb-16">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-7xl mx-auto overflow-scroll">
        <div className="flex gap-6 flex-col md:flex-row">
          <div className="flex flex-col items-center">
            <FaRegUserCircle className="w-24 h-24 text-gray-400" />
            <h2 className="mt-2 text-xl font-semibold text-gray-800">Bob</h2>
            {showQr ? (
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setShowQr(false)}
              >
                <span className="text-sm">Hide QR</span>
                <FaRegEyeSlash className="text-gray-400 cursor-pointer" />
              </div>
            ) : (
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setShowQr(true)}
              >
                <span className="text-sm">Show QR</span>
                <FaEye className="text-gray-400 cursor-pointer" />
              </div>
            )}
          </div>
          <div className="text-gray-600">
            {loading ? (
              <div className="w-48 h-48 bg-gray-500 animate-pulse"></div>
            ) : (
              <>
                <p className="text-sm">
                  Peer ID: <span className="font-bold">{peerId}</span>
                </p>
                {/* <p className="text-sm">
                  Private Key:{" "}
                  <span className="font-bold">
                    {privateKey ? bytesToBase64(privateKey) : "N/A"}
                  </span>
                </p> */}
                <p className="text-sm">
                  Public Key:{" "}
                  <span className="font-bold">
                    {publicKey ? bytesToBase64(publicKey) : "N/A"}
                  </span>
                </p>
                <p className="text-sm">
                  Connected Peers:{" "}
                  <span className="font-bold">{peerNumber}</span>
                </p>
              </>
            )}
          </div>
          <div className="flex justify-center">
            {showQr ? (
              <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
                <QRCodeGenerator
                  value={publicKey ? bytesToBase64(publicKey) : "NO KEY"}
                />
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:gap-6">
          <FetchNfts />
          <OffChainNFTs />
        </div>
      </div>
      <div className="max-w-7xl mx-auto w-full">
        <Table />
      </div>
      <div className="max-w-7xl mx-auto w-full">
        <button
          onClick={handleInitializeChainStore}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Initialize ChainStore
        </button>
        {/* <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-xl font-semibold text-gray-800">Blocks</h2>
        <pre>{JSON.stringify(blocks, null, 2)}</pre>
      </div> */}
        <div className="max-w-7xl mx-auto w-full mt-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Blocks</h2>
          <div className="grid grid-cols-1 md:flex items-center gap-6 md:gap-1">
            {blocks.map((block, index) => (
              <React.Fragment key={index}>
                <div className="bg-white p-4 rounded-lg shadow-lg h-80 overflow-y-scroll gap-2 flex flex-col">
                  <p className="font-medium">Block #: {block.seq}</p>
                  <p className="font-medium text-xs">
                    Address: {block.cid.multihash.digest}
                  </p>
                  <p className="font-medium text-xs">
                    toypeof: {typeof block.cid.multihash.digest}
                  </p>
                  {/* <p className="font-medium">Block #: {index}</p> */}
                  <pre className="text-sm">
                    {JSON.stringify(block, null, 2)}
                  </pre>
                </div>
                {index < blocks.length - 1 && (
                  <hr className="border-t-2 border-gray-400 h-2 w-24 hidden md:flex" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

Profile.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Profile;
