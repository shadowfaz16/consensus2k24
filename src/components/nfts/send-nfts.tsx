import React, { useState, useEffect, memo } from "react";
import {
  createThirdwebClient,
  getContract,
  resolveMethod,
  prepareContractCall,
} from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { ThirdwebProvider } from "thirdweb/react";
import { useSendTransaction } from "thirdweb/react";
import { CovalentClient } from "@covalenthq/client-sdk";
import { BaseBlock, ChainStore, GenesisBlock } from "../../network/chain";
import ImageUploader from "../image/image-fetch";
import { useActiveAccount } from "thirdweb/react";
import { FaTimes } from "react-icons/fa";
import { CID } from "multiformats";
import useNetwork from "@/hooks/useNetwork";
import { keys as libp2pKeys } from "@libp2p/crypto";
import useStore from "@/store/store";
import { IoScanSharp } from "react-icons/io5";
import QRCodeScanner from "../qr/QRCodeScanner";
import {getNetworkInstance} from "@/hooks/networkManager";

interface TransactionInfo {
  block_height: number;
  tx_hash: string;
  from_address: string;
  to_address: string;
}

interface SendNFTProps {
  contract_address?: string;
  token_id?: number;
  image_url?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onTransactionSuccess?: () => void; // Add this prop
}

// create the client with your clientId, or secretKey if in a server environment
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

const SendNFT = ({
  contract_address,
  token_id,
  image_url,
  isOpen,
  onTransactionSuccess,
  onClose,
}: SendNFTProps) => {
  const generatedUserWallet = useStore((state) => state.userGeneratedWallet);
  const wallet = useActiveAccount();
  const userWallet = wallet?.address;
  const [transactionInfo, setTransactionInfo] =
    useState<TransactionInfo | null>(null);
  const [receiver, setReceiver] = useState<string>("");
  const [stateHash, setStateHash] = useState<string | null>(null);
  const [blockHeight, setBlockHeight] = useState<number>(0);
  const [allSuccess, setAllSuccess] = useState<boolean>(false);
  const { privateKey, publicKey } = useNetwork();
  const [scannedValue, setScannedValue] = useState("");
  const [scan, setScan] = useState(false);
  const [cid, setCid] = useState<CID | null>(null);
  const network = getNetworkInstance();


  const handleScan = (data: string) => {
    setScannedValue(data);
    navigator.clipboard.writeText(data).then(() => {
      // alert("Copied to clipboard");
    });
  };

  const handleCidReceived = (newCid: CID) => {
    setCid(newCid);
  };

  // connect to your contract
  const contract = getContract({
    client,
    chain: defineChain(30),
    address: contract_address
      ? contract_address
      : "0xEF267Bbd18e11e703D054a01ded08b697029cc19",
  });


  console.log("CID FOR IMAGE: ", cid);

  const createBlock = async () => {
    if (transactionInfo && cid) {
      console.log("hello Will");
      try {
        const private_key = await ChainStore.key();

        console.log("hello its me");

        if (!private_key) {
          console.error("Public or private key is missing.");
          return;
        }
        console.log("Creating new block...");
        const genesis = await ChainStore.genesis();
        if (genesis == null) {
          console.error("Missing genesis block");
          return;
        }
        console.log("almost done: ");
        const newBlock = await ChainStore.create(
          genesis,
          {
            type: "Import",
            chain: "RSK",
            block_height: transactionInfo.block_height,
            tx_hash: transactionInfo.tx_hash,
            sender_address: transactionInfo.from_address,
            to_address: transactionInfo.to_address,
            asset: cid,
          },
          private_key
        );
        console.log("New Block Created: ", newBlock);
      } catch (error) {
        console.error("Error creating new block: ", error);
      }
    }
  };

  return (
    <ThirdwebProvider>
      <div className="p-7 bg-white rounded-lg shadow-lg relative w-full overflow-x-scroll md:w-[50%] z-20"
      onClick={() => setScan(false)}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 text-sm"
        >
          <FaTimes />
        </button>
        <h1 className="font-medium">Send NFTs</h1>
        <p className="text-sm">
          to another private network by typing their address or scanning their
          QR code
        </p>
        {/* <p>Contract address: {contract_address}</p>
        <p>Token Id: {token_id}</p>
        <p>Image url: {image_url}</p> */}
        <div className="flex items-center border border-gray-300 rounded-lg w-full mt-4">
          <input
            type="text"
            placeholder="Receiver Address"
            className="p-2 w-full border-r"
            value={scannedValue}
            onChange={(e) => setScannedValue(e.target.value)}
          />
          <IoScanSharp
            className="text-2xl text-gray-500 mx-2"
            onClick={(e) => {
              e.stopPropagation();
              setScan(true);
            }
            }
          />
        </div>
        <button
          className={`mt-4 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50`}
          onClick={() => network.exportAsset(cid)}
        >
          Send NFT
        </button>
        {transactionInfo !== null && (
          <button
            // onClick={() => network.exporAsset(cid)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded mx-4"
          >
            create block
          </button>
        )}
        {/* <p className="mt-2">Status: {status}</p> */}
        <ImageUploader
          imageUrl={image_url as string}
          onCidReceived={handleCidReceived}
        />
         {scan ?
         <div className="fixed z-10 top-20 right-0 left-0 bottom-0  w-full flex justify-center">
           <QRCodeScanner onScan={handleScan} scannedValue={scannedValue} />
         </div>
           : null}
      </div>
      
    </ThirdwebProvider>
  );
};

export default memo(SendNFT);
