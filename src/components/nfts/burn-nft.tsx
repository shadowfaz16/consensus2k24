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
import Link from "next/link";
import useBlockStore from "@/store/blockStore";

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
  onTransactionSuccess: () => void; // Add this prop
}

// create the client with your clientId, or secretKey if in a server environment
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

const BurnNFT = ({
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

  const addBlock = useBlockStore((state) => state.addBlock);
  const lastBlock = useBlockStore((state) => state.lastBlock);


  const [cid, setCid] = useState<CID | null>(null);

  const handleCidReceived = (newCid: CID) => {
    setCid(newCid);
  };

  // connect to your contract
  const contract = getContract({
    client,
    chain: defineChain(30),
    address: contract_address
      ? contract_address
      : "0x694E30a30fCB1c85a7b17C70ADE0Bdb51f4960F0",
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
        params: [userWallet, generatedUserWallet, token_id],
      });
      const { transactionHash } = await sendTransaction(transaction);
      setStateHash(transactionHash);
      console.log("Transaction Hash call: ", transactionHash);
      setTimeout(() => {
        HashInfo(transactionHash);
        console.log("fist call done")
      }, 25000);
  };

  useEffect(() => {
    if (transactionInfo?.block_height && cid) {
      createBlock();
      onTransactionSuccess();
    }
  }, [transactionInfo, cid]);
 
  console.log("STATE HASH: ", stateHash);

  const HashInfo = async (txHash: string) => {
    try {
      const client = new CovalentClient("cqt_rQJQcxMbk6yHpHYCRhVcXV4kvfwd");
      const resp = await client.TransactionService.getTransaction(
        "rsk-mainnet",
        txHash,
      );
      const { block_height, tx_hash, from_address, to_address } =
        resp.data.items[0];
        console.log("HASH INFO: ", resp.data.items[0]);

        if(block_height == null) {
          setTimeout(() => HashInfo(txHash));
        } else {

        setBlockHeight(resp.data.items[0].block_height);
        console.log("Block Heighttttt: ", blockHeight);
        setTransactionInfo({ block_height, tx_hash, from_address, to_address });
        }
    } catch (error) {
      console.error("Error fetching transaction info:", error);
      setTimeout(() => HashInfo(txHash));
    }
  };

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
        console.log("Creating new block...")
        const parentBlock = lastBlock || (await ChainStore.genesis());
        if (!parentBlock) {
          console.error("Missing parent block");
          return;
        }

        console.log("almost done: ");
        const newBlock = await ChainStore.create(
          parentBlock,
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
        addBlock(newBlock); // Add the new block to the global state
        setAllSuccess(true);
      } catch (error) {
        console.error("Error creating new block: ", error);
      }
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
        <h1 className="font-medium">Migrate your NFT</h1>
        <p className="text-sm">
        Migrate your NFT and store it in your private network
        </p>
        {/* <p>Contract address: {contract_address}</p>
        <p>Token Id: {token_id}</p>
        <p>Image url: {image_url}</p> */}
        <button
          onClick={call}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          disabled={isPending}
        >
          {isPending && "Migrating..."}
          {isSuccess && !transactionInfo && "Migrating..."}
          {isSuccess && transactionInfo && "Creating private block"}
          {!isPending && !isSuccess && !error && "Migrate"}
          {isError && "Error"}
          {allSuccess && "New block has been minted!"}
        </button>
        {transactionInfo !== null && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <Link target="_blank" href={`https://explorer.rootstock.io/tx/${transactionInfo.tx_hash}`} className="font-medium text-sm text-blue-400 hover:text-blue-600">View your transaction in the scanner!</Link>
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

export default memo(BurnNFT);
