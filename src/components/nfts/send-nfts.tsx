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
  const wallet = useActiveAccount();
  const userWallet = wallet?.address;
  const [transactionInfo, setTransactionInfo] =
    useState<TransactionInfo | null>(null);
  const [receiver, setReceiver] = useState<string>("");

  const [stateHash, setStateHash] = useState<string | null>(null);

  const [blockHeight, setBlockHeight] = useState<number>(0);

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
    mutateAsync: sendTransaction,
    isPending,
    isError,
    error,
    status,
    isSuccess,
    data,
    variables
  } = useSendTransaction();

  console.log("CID FOR IMAGE: ", cid);

  const call = async () => {
      const transaction = await prepareContractCall({
        contract,
        method: resolveMethod("safeTransferFrom"),
        params: [userWallet, receiver, token_id],
      });
      const { transactionHash } = await sendTransaction(transaction);
      setStateHash(transactionHash);
      console.log("Transaction Hash call: ", transactionHash);
      setTimeout(() => {
        HashInfo(transactionHash);
      }, 20000);
      console.log("fist call done")
      setTimeout(() => {
      createBlock();
      }, 25000);
      console.log("second call done")
  };
 
  console.log("STATE HASH: ", stateHash);

  const HashInfo = async (txHash: string) => {
    try {
      const client = new CovalentClient("cqt_rQJQcxMbk6yHpHYCRhVcXV4kvfwd");
      const resp = await client.TransactionService.getTransaction(
        "eth-sepolia",
        txHash,
      );
      const { block_height, tx_hash, from_address, to_address } =
        resp.data.items[0];

        console.log("HASH INFO: ", resp.data.items[0]);
        setBlockHeight(resp.data.items[0].block_height);
        console.log("Block Heighttttt: ", blockHeight);

      setTransactionInfo({ block_height, tx_hash, from_address, to_address });
    } catch (error) {
      console.error("Error fetching transaction info:", error);
    }
  };

  const createBlock = async () => {
    if (transactionInfo?.block_height && cid) {
      try {
        const private_key = await ChainStore.key();

        if (!private_key) {
          console.error("Public or private key is missing.");
          return;
        }
        console.log("Creating new block...")
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
          private_key,
        );
        console.log("New Block Created: ", newBlock);
      } catch (error) {
        console.error("Error creating new block: ", error);
      }
    }
  };

  // const allFunctionsTogether = async () => {
  //   setAllSuccess(false);
  //   try {
  //     await call(); // Initiates the transaction
  //     console.log("Transaction Info Fetched Successfully!");
  //     await createBlock();
  //     setAllSuccess(true);
  //     console.log("All functions executed successfully!");
  //   } catch (error) {
  //     console.error("Error in allFunctionsTogether:", error);
  //   }
  // };

  return (
    <ThirdwebProvider>
      <div className="p-7 bg-white rounded-lg shadow-lg relative w-full overflow-x-scroll md:w-[50%]">
        <button
          onClick={()=> call}
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
          onClick={call}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          disabled={isPending}
        >
          {isPending && "Sending..."}
          {isSuccess && !transactionInfo?.block_height && "Sending..."}
          {isSuccess && transactionInfo?.block_height && "Sent!"}
          {!isPending && !isSuccess && !error && "Send"}
          {isError && "Error"}
        </button>
        {
          transactionInfo !== null && (
        <button
          onClick={()=> createBlock()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded mx-4"
        >
          create block
        </button> )
        }
        {/* <p className="mt-2">Status: {status}</p> */}
        {transactionInfo !== null && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h2 className="font-medium">Transaction Info</h2>
            <p>Block Height: {transactionInfo?.block_height}</p>
            <p>Transaction Hash: {transactionInfo?.tx_hash}</p>
            <p>From Address: {transactionInfo?.from_address}</p>
            <p>To Address: {transactionInfo?.to_address}</p>
          </div>
        )}
        <ImageUploader
          imageUrl={image_url as string}
          onCidReceived={handleCidReceived}
        />
        <div>
          {cid && (
            <div className="mt-4">
              <p className="text-xs">Image CID fetched correctly</p>
            </div>
          )}
        </div>
      </div>
    </ThirdwebProvider>
  );
};

export default memo(SendNFT);
