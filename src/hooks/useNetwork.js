// useNetwork.js
import { useEffect } from "react";
import { Network } from "@/network";
import useStore from "@/store/store";
import { bytesToHex, bytesToBase64 } from "@/ultils/utils"; // Import conversion functions
import {setNetworkInstance} from "@/hooks/networkManager";

const useNetwork = () => {
  const setPeerId = useStore((state) => state.setPeerId);
  const setKeys = useStore((state) => state.setKeys);
  const setLoading = useStore((state) => state.setLoading);
  const loading = useStore((state) => state.loading);
  const peerId = useStore((state) => state.peerId);
  const privateKey = useStore((state) => state.privateKey);
  const publicKey = useStore((state) => state.publicKey);
    const setPeers = useStore((state) => state.setPeers);
  const addPeer = useStore((state) => state.addPeer);
  const peerNumber = useStore((state) => state.peerNumber);
  const setPeerNumber = useStore((state) => state.setPeerNumber);


  useEffect(() => {
    if (!peerId) {
      const initializeNetwork = async () => {
        setLoading(true);
        let network = new Network();
        console.log("starting network");
        await network.init();
        console.log("network started");
        const peerIdString = network.libp2p.peerId.toString();
        const privateKeyBytes = network.libp2p.peerId.privateKey;
        const publicKeyBytes = network.libp2p.peerId.publicKey;
        console.log("network", network);
        console.log("network string:", peerIdString);
        console.log("private key bytes:", privateKeyBytes);
        console.log("public key bytes :", publicKeyBytes);
        // console.log("connected peers: ", network.libp2p.peerStore.store.datastore.data.length);
        // console.log("connected peer store: ", network.libp2p.peerStore.store.datastore);
        // console.log("connected peer store data: ", network.libp2p.peerStore.store.datastore.data.size);

        setPeerId(peerIdString);
        setKeys(privateKeyBytes, publicKeyBytes);
        setNetworkInstance(network); // Save the network instance
        // setPeerNumber(network.libp2p.peerStore.store.datastore.data.size);
      };

      initializeNetwork();
    } else {
      setLoading(false);
    }
  }, [peerId, setPeerId, setKeys, setLoading]);

  return { loading, peerId, privateKey, publicKey, peerNumber };
};

export default useNetwork;
