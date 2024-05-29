import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { createThirdwebClient } from "thirdweb";
import { ThirdwebProvider, ConnectButton } from "thirdweb/react";



export default function App({ Component, pageProps }: AppProps) {
  return (
  <ThirdwebProvider>
  <Component {...pageProps} />
  </ThirdwebProvider>
)
}
