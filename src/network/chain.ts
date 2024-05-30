import { IDBBlockstore } from "blockstore-idb";
import { CID, MultihashDigest } from "multiformats";
import { sha256 } from "multiformats/hashes/sha2";
import { PrivateKey, PublicKey } from "@libp2p/interface";
import { Encoder, Decoder } from "cbor-web";

let db: ChainStore | null = null;
export type Data = GenesisBlock;
export type GenesisBlock = {
  key: PublicKey;
};
export type BaseBlock = {
  root: CID<unknown, 113, 18, 1> | null;
  parent: CID<unknown, 113, 18, 1> | null;
  seq: number;
  block_type: "Genesis";
  data: Data;
  hash: Uint8Array;
  sig: Uint8Array;
  cid: CID<unknown, 113, 18, 1>;
};

async function cid(bytes: Uint8Array): Promise<CID> {
  return CID.create(1, 0x51, await sha256.digest(bytes));
}

export class ChainStore {
  blockstore: IDBBlockstore | null = null;
  static async init() {
    let self = new ChainStore();
    const store = new IDBBlockstore("blocks");
    await store.open();
    self.blockstore = store;
    db = self;
  }
  static ready() {
    if (db == null) {
      throw new Error("db not initialized");
    }
  }
  static async create(
    parent: BaseBlock | null,
    data: Data,
    key: PrivateKey,
  ): Promise<BaseBlock> {
    let rcid = null;
    let pcid = null;
    let seq = 0;
    if (parent != null) {
      rcid = parent.root || parent.cid;
      pcid = parent.cid;
      seq = parent.seq + 1;
    }
    let unsigned = Encoder.encode({ parent: pcid?.bytes, seq, data });
    let hash = await sha256.digest(unsigned);
    let sig = new Uint8Array(await key.sign(hash.bytes));
    let signed = Encoder.encode({
      root: rcid?.bytes || null,
      parent: pcid?.bytes || null,
      seq,
      block_type: "Genesis",
      data,
      hash: hash.bytes,
      sig,
    });
    let address = await cid(signed);
    let block = {
      root: rcid,
      parent: pcid,
      seq,
      block_type: "Genesis",
      data,
      hash: hash.bytes,
      sig,
      cid: address,
    } as BaseBlock;
    ChainStore.ready();
    await db?.blockstore?.put(address, signed);
    return block;
  }
  static async get(address: CID): Promise<BaseBlock | undefined> {
    let bytes = await db?.blockstore?.get(address);
    if (bytes === undefined) {
      return undefined;
    }
    let signed = (await Decoder.decodeFirst(bytes, {
      required: true,
    })) as any;
    if (signed.root) {
      let [root] = CID.decodeFirst(signed.root as Uint8Array);
      signed.root = root;
    }
    if (signed.parent) {
      let [parent] = CID.decodeFirst(signed.parent as Uint8Array);
      signed.parent = parent;
    }
    console.log(signed.root);
    signed.cid = (await cid(new Uint8Array(bytes))) as CID<unknown, 113, 18, 1>;
    return signed;
  }
}
