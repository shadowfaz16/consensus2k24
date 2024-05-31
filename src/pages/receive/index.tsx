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
import SendNFT from "@/components/nfts/send-nfts";
import OffChainNFTs from "@/components/nfts/off-chain-nfts";
import ImageUploader from "@/components/image/image-fetch";
import Blocks from "@/components/private/blocks";

const Profile = () => {
  const { peerId, privateKey, publicKey, peerNumber } = useNetwork();
  const loading = useStore((state) => state.loading);
  const [showQr, setShowQr] = React.useState(false);

  if (loading) {
    return (
      <div className="min-h-[92dvh] flex flex-col items-center justify-center">
        <div className="w-5 h-5 rounded-full bg-blue-500 animate-bounce mb-2"></div>
        <p>
          LOADING
        </p>
        <p>
          Please wait until your private network is ready
        </p>
        <p>
          this should only take a few seconds
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[92dvh] flex flex-col items-center bg-gray-100 p-4 gap-4 pb-16">
      {/* <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-7xl mx-auto overflow-scroll">
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
      </div> */}
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
        <Blocks />
      </div>
    </div>
  );
};

Profile.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Profile;
