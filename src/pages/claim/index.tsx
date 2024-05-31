import Layout from "@/components/layout";
import React from "react";
import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { prepareContractCall, sendTransaction, resolveMethod } from "thirdweb";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

const Claim = () => {
  const wallet = useActiveAccount();
  const user_wallet = wallet?.address;

  // connect to your contract
  const contract = getContract({
    client,
    chain: defineChain(30),
    address: "0x694E30a30fCB1c85a7b17C70ADE0Bdb51f4960F0",
  });

  const { mutateAsync: sendTransaction, isError } = useSendTransaction();

  const call = async () => {
    const transaction = await prepareContractCall({
      contract,
      method: resolveMethod("claim"),
      params: [
        user_wallet,
        1,
        "0x542fDA317318eBF1d3DEAf76E0b632741A7e677d",
        0,
        {
          proof: [
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          ],
        },
        0x00,
      ],
    });
    const { transactionHash } = await sendTransaction(transaction);
    console.log("Transaction Hash:", transactionHash);
    console.log("Error:", isError);
  };
  return (
    <div className="min-h-screen bg-gray-100 pt-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-7">
        <h3 className="font-medium">Claim your free NFT now!</h3>
        <p>Be a part of private equity sales of NFTs using BTC products.</p>
        <p className="mt-6 mb-2 font-medium">How it Works:</p>
        <ul className="flex flex-col gap-2">
          <li>
            - Claim your free NFT on chain{" "}
            <span className="text-sm">
              (you'll only need to pay for gas{" "}
              <span className="font-medium">which is cheap on RSK!</span>)
            </span>
          </li>
          <li>- Transfer it to your own personal browser blockchain</li>
          <li>
            - Transfer it to other personal blockchains or export it to hold it
            in your hands!
          </li>
        </ul>
        <button
          className="mt-6 px-4 py-2 bg-emerald-500 text-white rounded"
          onClick={call}
        >
          Claim NFT
        </button>
      </div>
    </div>
  );
};

Claim.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Claim;
