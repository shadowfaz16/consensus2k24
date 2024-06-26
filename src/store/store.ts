// store.js
import {create} from "zustand";
import { persist } from 'zustand/middleware'

type Store = {
  peerId: any;
  privateKey: any;
  peers: any;
  publicKey: any;
  loading: boolean;
  peerNumber: number;
  userGeneratedWallet: any;
  qrString: string;
  network: any; // Add network state
  setPeerId: (peerId: any) => void;
  setKeys: (privateKey: any, publicKey: any) => void;
  setUserGeneratedWallet: (userGeneratedWallet: any) => void;
  setPeers: (peers: any) => void;
  addPeer: (peer: any) => void;
  setLoading: (loading: any) => void;
  setPeerNumber: (peerNumber: any) => void;
  setQrString: (qrString: any) => void;
  setNetwork: (network: any) => void; // Add setter for network
};

const useStore = create<Store>()(persist((set) => ({
  peerId: null,
  privateKey: null,
  peers: [],
  publicKey: null,
  loading: true,
  peerNumber: 0,
  userGeneratedWallet: null,
  qrString: "",
  network: null, // Initialize network state
  setPeerId: (peerId: any) => set({ peerId, loading: false }),
  setKeys: (privateKey: any, publicKey: any) => set({ privateKey, publicKey }),
  setUserGeneratedWallet: (userGeneratedWallet: any) => set({ userGeneratedWallet }),
  setPeers: (peers: any) => set({ peers }),
  setQrString: (qrString: any) => set({ qrString }),
  addPeer: (peer: any) => set((state: { peers: any; }) => ({ peers: [...state.peers, peer] })),
  setLoading: (loading: any) => set({ loading }),
    setPeerNumber: (peerNumber: any) => set({ peerNumber }),
    setNetwork: (network: any) => set({ network }), // Add setter for network

}), {
  name: 'libp2p-store',
}));

export default useStore;
