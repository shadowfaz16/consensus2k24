import {create} from "zustand";
import { BaseBlock } from "@/network/chain";
import { persist } from 'zustand/middleware'

interface BlockchainState {
  blocks: BaseBlock[];
  lastBlock: BaseBlock | null;
  setBlocks: (blocks: BaseBlock[]) => void;
  addBlock: (block: BaseBlock) => void;
  setLastBlock: (block: BaseBlock) => void;
}

const useBlockStore = create<BlockchainState>()(persist((set) => ({
  blocks: [],
  lastBlock: null,
  setBlocks: (blocks) => set({ blocks, lastBlock: blocks[blocks.length - 1] || null }),
  setLastBlock: (block) => set({ lastBlock: block }),
  addBlock: (block) => set((state) => ({
    blocks: [...state.blocks, block],
  })),
}),
{
  name: 'block-store',
  getStorage: () => localStorage, // or sessionStorage
})
);

export default useBlockStore;