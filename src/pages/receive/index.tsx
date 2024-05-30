import React from "react";
import QRCodeGenerator from "@/components/qr/QrGenerator";
import Layout from "@/components/layout";
import { FaRegUserCircle } from "react-icons/fa";
import useStore from "@/store/store";
import useNetwork from "@/hooks/useNetwork";
import { bytesToHex, bytesToBase64 } from "@/ultils/utils"; // Import conversion functions
import { bytesToString, stringToBytes, toBytes } from "thirdweb";

const Profile = () => {
  const { loading, peerId, privateKey, publicKey, peerNumber } = useNetwork();

  return (
    <div className="min-h-[92dvh] flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-sm w-full">
        <div className="flex flex-col items-center">
          <FaRegUserCircle className="w-24 h-24 text-gray-400" />
          <h2 className="mt-4 text-xl font-semibold text-gray-800">Bob</h2>
          <div className="text-gray-600">
            {loading ? (
              <div className="w-48 h-48 bg-gray-500 animate-pulse"></div>
            ) : (
              <>
                <p>Peer ID{peerId}</p>
                <p>
                  Private Key (Hex):{" "}
                  {privateKey ? bytesToHex(privateKey) : "N/A"}
                </p>
                <p>
                  Public Key (Hex): {publicKey ? bytesToHex(publicKey) : "N/A"}
                </p>
                <p>
                  Private Key (Base64):{" "}
                  {privateKey ? bytesToBase64(privateKey) : "N/A"}
                </p>
                <p>
                  Public Key (Base64):{" "}
                  {publicKey ? bytesToBase64(publicKey) : "N/A"}
                </p>
                <p>Connected Peers: {peerNumber}</p>
                {/* <ul>
                  {peers.map((peer: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined, index: React.Key | null | undefined) => (
                    <li key={index}>{peer}</li>
                  ))}
                </ul> */}
              </>
            )}
          </div>
          <p className="text-gray-600">Austin, Texas, USA</p>
        </div>
        <div className="mt-6 flex justify-center">
          <div className="w-32 h-32 bg-gray-200 flex items-center justify-center">
            {/* QR Code will be placed here */}
            <QRCodeGenerator value="https://example.com" />
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
