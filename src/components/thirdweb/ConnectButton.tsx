import { createThirdwebClient } from "thirdweb";
import { ThirdwebProvider, ConnectButton } from "thirdweb/react";

const client = createThirdwebClient({ clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!});

export default function Connectbutton() {
  return (
    <ThirdwebProvider>
      <ConnectButton client={client}
      chains={[{
        id: 30,
        rpc: "30.rpc.thirdweb.com",
      },
      {
        id: 31,
        rpc: "31.rpc.thirdweb.com",
      }
    ]
      }
       />
    </ThirdwebProvider>
  );
}
