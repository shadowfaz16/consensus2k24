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
import useNetwork from "@/hooks/useNetwork";

interface TransactionInfo {
  block_height: number;
  tx_hash: string;
  from_address: string;
  to_address: string;
}

// create the client with your clientId, or secretKey if in a server environment
export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

// connect to your contract
export const contract = getContract({
  client,
  chain: defineChain(11155111),
  address: "0xEF267Bbd18e11e703D054a01ded08b697029cc19",
});

export default function SendNFT() {
  const [transactionInfo, setTransactionInfo] =
    useState<TransactionInfo | null>(null);

    console.log("Full transaction info: ", transactionInfo);

  const { privateKey } = useNetwork();



  const {
    mutate: sendTransaction,
    isPending,
    isError,
    error,
    status,
    isSuccess,
    data,
  } = useSendTransaction();

  const call = async () => {
    const transaction = await prepareContractCall({
      contract,
      method: resolveMethod("transferFrom"),
      params: [
        "0x68a7D0971d886Cf5CdB4fDd63198B695293e5E51",
        "0xe3A29CbE78E0aF6664C6403fE47c7f8848CAe73e",
        2,
      ],
    });
    await sendTransaction(transaction);
    console.log("transaction info: ", transaction);
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
      console.log("Transaction Info: ", resp.data.items[0]);
      console.log("block height: ", block_height);
      console.log("tx hash: ", tx_hash);
      console.log("from address: ", from_address);
      console.log("to address: ", to_address);

    } catch (error) {
      console.error("Error fetching transaction info:", error);
    }
  };

  useEffect(() => {
    if (data?.transactionHash) {
      HashInfo(data.transactionHash);
    }
  }, [data]);


  const genesis = async () => {
    const block0 = await ChainStore.roots();
    console.log("Block 0: ", block0);
    const genblock = await ChainStore.get(block0[0]);
    console.log("Genesis Block 000: ", genblock);
  };


  return (
    <ThirdwebProvider>
      <div className="p-7 bg-white rounded-lg shadow-lg">
        <h1 className="font-medium">Send NFTs</h1>
        <p>Contract address: 1</p>
        <p>Token Id: 0</p>
        <button
          onClick={call}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          disabled={isPending}
        >
          {isPending && "Sending..."}
          {isSuccess && "Sent!"}
          {!isPending && !isSuccess && !error && "Send"}
          {isError && "Error"}
        </button>
        <p className="mt-2">Status: {status}</p>
        {transactionInfo?.block_height && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h2 className="font-medium">Transaction Info</h2>
            <p>Block Height: {transactionInfo.block_height}</p>
            <p>Transaction Hash: {transactionInfo.tx_hash}</p>
            <p>From Address: {transactionInfo.from_address}</p>
            <p>To Address: {transactionInfo.to_address}</p>
          </div>
        )}
      </div>
    </ThirdwebProvider>
  );
}
