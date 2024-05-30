import { createThirdwebClient, getContract, resolveMethod } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { ThirdwebProvider } from "thirdweb/react";
import { useReadContract } from "thirdweb/react";


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

export default function Balance() {

    const { data, isLoading } = useReadContract({ 
        contract, 
        method: resolveMethod("balanceOf") as any, 
        params: ["0x68a7D0971d886Cf5CdB4fDd63198B695293e5E51"] 
      });

      const balanceString = data ? String(data) : "No balance available"; // Convert bigint to string
      const balanceNumber = data ? Number(data) : 0; // Convert bigint to number (be careful with large values)
    

      console.log("data", data);
      console.log("data type", typeof data);

  return (

        <div>
            {isLoading ? (
                <div>Loading...</div>
            ) : (
                <div>
                    <p className="text-black">
                        Wallet balance: {balanceString}
                        {/* Number: {balanceNumber} */}
                    </p>
                </div>
            )}
        </div>

  )
}