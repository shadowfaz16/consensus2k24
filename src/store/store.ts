// store.js
import {create} from "zustand";

const useStore = create((set) => ({
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
}));

export default useStore;
