import React, { useState, useEffect } from "react";
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

export default function SendNFT({
  contract_address,
  token_id,
  image_url,
  isOpen,
  onTransactionSuccess,
  onClose,
}: SendNFTProps) {
  const wallet = useActiveAccount();
  const userWallet = wallet?.address;
  const [transactionInfo, setTransactionInfo] =
    useState<TransactionInfo | null>(null);
  const [receiver, setReceiver] = useState<string>("");
  const [allSuccess, setAllSuccess] = useState<boolean>(false);
  const { privateKey, publicKey } = useNetwork();

  const [cid, setCid] = useState<CID | null>(null);

  const handleCidReceived = (newCid: CID) => {
    setCid(newCid);
  };

  // connect to your contract
  const contract = getContract({
    client,
    chain: defineChain(11155111),
    address: contract_address
      ? contract_address
      : "0xEF267Bbd18e11e703D054a01ded08b697029cc19",
  });

  const {
    mutate: sendTransaction,
    isPending,
    isError,
    error,
    status,
    isSuccess,
    data,
  } = useSendTransaction();

  console.log("CID FOR IMAGE: ", cid);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (isSuccess && data?.transactionHash) {
      const txHash = data.transactionHash;
      intervalId = setInterval(async () => {
        const result = await HashInfo(txHash);
        if (transactionInfo?.block_height) {
          clearInterval(intervalId as NodeJS.Timeout);
          if (onTransactionSuccess) {
            onTransactionSuccess(); // Call the callback function
          }
        }
      }, 3000); // Poll every 5 seconds
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isSuccess, data]); // Add isSuccess to dependency array

  const call = async () => {
    const transaction = await prepareContractCall({
      contract,
      method: resolveMethod("safeTransferFrom"),
      params: [userWallet, receiver, token_id],
    });
    sendTransaction(transaction);
  };

  const HashInfo = async (txHash: string) => {
    try {
      const client = new CovalentClient("cqt_rQJQcxMbk6yHpHYCRhVcXV4kvfwd");
      const resp = await client.TransactionService.getTransaction(
        "eth-sepolia",
        txHash
      );
      const { block_height, tx_hash, from_address, to_address } =
        resp.data.items[0];

      setTransactionInfo({ block_height, tx_hash, from_address, to_address });
    } catch (error) {
      console.error("Error fetching transaction info:", error);
    }
  };

  const createBlock = async () => {
    if (transactionInfo && cid) {
      try {
        const private_key = await libp2pKeys.unmarshalPrivateKey(privateKey);
        const key = await libp2pKeys.unmarshalPublicKey(publicKey);
  
        if (!private_key || !key) {
          console.error("Public or private key is missing.");
          return;
        }
        const newBlock = await ChainStore.create(
          null,
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

  const allFunctionsTogether = async () => {
    setAllSuccess(false);
    try {
      await call();
      await HashInfo(data?.transactionHash as string);
      console.log("SUCCESS!!!");
      await createBlock();
      setAllSuccess(true);
      console.log("All functions executed successfully!");
    } catch (error) {
      console.error("Error in allFunctionsTogether:", error);
    }
  };

  return (
    <ThirdwebProvider>
      <div className="p-7 bg-white rounded-lg shadow-lg relative w-full overflow-x-scroll md:w-[50%]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 text-sm"
        >
          <FaTimes />
        </button>
        <h1 className="font-medium">Send NFTs</h1>
        {/* <p>Contract address: {contract_address}</p>
        <p>Token Id: {token_id}</p>
        <p>Image url: {image_url}</p> */}
        <input
          type="text"
          placeholder="Receiver Address"
          className="mt-4 p-2 border border-gray-300 rounded w-full"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
        />
        <button
          onClick={allFunctionsTogether}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          disabled={isPending}
        >
          {isPending && "Sending..."}
          {isSuccess && !transactionInfo?.block_height && "Sending..."}
          {isSuccess && transactionInfo?.block_height && "Sent!"}
          {!isPending && !isSuccess && !error && "Send"}
          {isError && "Error"}
        </button>
        <p className="mt-2">Status: {status}</p>
        {allSuccess && transactionInfo && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h2 className="font-medium">Transaction Info</h2>
            <p>Block Height: {transactionInfo.block_height}</p>
            <p>Transaction Hash: {transactionInfo.tx_hash}</p>
            <p>From Address: {transactionInfo.from_address}</p>
            <p>To Address: {transactionInfo.to_address}</p>
          </div>
        )}
        <ImageUploader
          imageUrl={image_url as string}
          onCidReceived={handleCidReceived}
        />
        <div>
          {cid && (
            <div>
              <h2>Image CID fetched correctly</h2>
              {transactionInfo?.block_height && (
                <p>Block Height: {transactionInfo.block_height}</p>
              )}
              {/* <p>{cid}</p> */}
            </div>
          )}
        </div>
      </div>
    </ThirdwebProvider>
  );
}
