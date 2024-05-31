import { createThirdwebClient, getContract, resolveMethod, prepareContractCall } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { ThirdwebProvider } from "thirdweb/react";
import { useSendTransaction } from "thirdweb/react";

interface NFT {
    tokenId: string;
    contractAddress: string;
}

// create the client with your clientId, or secretKey if in a server environment
export const client = createThirdwebClient({ 
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID! 
});

// connect to your contract
export const contract = getContract({ 
  client, 
  chain: defineChain(31), 
  address: "0xEC48D00A764c7280C53A05990e5492718bF1F892"
});

export default function SendNFT() {
    
    const { mutate: sendTransaction, isPending, isError, error, status, isSuccess } = useSendTransaction();

    const call = async () => {
      const transaction = await prepareContractCall({ 
        contract, 
        method: resolveMethod("transferFrom"), 
        params: ["0x68a7D0971d886Cf5CdB4fDd63198B695293e5E51", "0x33Ac025056f7936b55CDa9b4ef0397648C5f0615", 1] 
      });
        await sendTransaction(transaction);
    }

    console.log("isPending", isPending);
    console.log("isError", isError.valueOf());
    console.log("error", error);
    console.log("status", status);
    console.log("isSuccess", isSuccess);

  return (
    <ThirdwebProvider>
        <div className="p-7 bg-white rounded-lg shadow-lg">
            <h1 className="font-medium">Send NFTs</h1>
            <p>Contract address: 1</p>
            <p>Token Id: 0</p>
            <button
                onClick={call}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
                {
                    isPending && "Sending..."
                }
                {
                    isSuccess && "Sent!"
                }
                {
                    !isPending && !isSuccess && !error && "Send"
                }
                {
                    isError && "Error"
                }
            </button>
            <p className="mt-2">
                Status: {status}
            </p>
            <p>
            </p>
        </div>
    </ThirdwebProvider>
  )
}