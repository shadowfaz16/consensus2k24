// store.js
import {create} from "zustand";
import { persist } from 'zustand/middleware'

const useStore = create(persist((set) => ({
  peerId: null,
  privateKey: null,
  peers: [],
  publicKey: null,
  loading: true,
  peerNumber: 0,
  setPeerId: (peerId: any) => set({ peerId, loading: false }),
  setKeys: (privateKey: any, publicKey: any) => set({ privateKey, publicKey }),
  setPeers: (peers: any) => set({ peers }),
  addPeer: (peer: any) => set((state: { peers: any; }) => ({ peers: [...state.peers, peer] })),
  setLoading: (loading: any) => set({ loading }),
    setPeerNumber: (peerNumber: any) => set({ peerNumber }),
}), {
  name: 'libp2p-store',
}));

export default useStore;
