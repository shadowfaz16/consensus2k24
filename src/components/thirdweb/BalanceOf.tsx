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

    

  return (
    <ThirdwebProvider>
        <div>
            HELLO WORLD
        </div>
    </ThirdwebProvider>
  )
}