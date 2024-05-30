import { IDBBlockstore } from "blockstore-idb";
import CID, { BlockView } from "multiformats";
import { Block, encode, decode } from "multiformats/block";
import * as codec from "@ipld/dag-cbor";
import { sha256 as hasher } from "multiformats/hashes/sha2";
import { PrivateKey, PublicKey } from "@libp2p/interface";

let db: ChainStore | null = null;
type Data = Genesis;
type Genesis = {
  key: PublicKey;
};
type BaseBlock = {
  root: CID.CID<unknown, 113, 18, 1> | null;
  parent: CID.CID<unknown, 113, 18, 1> | null;
  seq: number;
  data: Data;
  hash: CID.CID<unknown, 113, 18, 1>;
  sig: Uint8Array;
};

export class ChainStore {
  blockstore: IDBBlockstore | null = null;
  async init() {
    const store = new IDBBlockstore("blocks");
    await store.open();
    this.blockstore = store;
    db = this;
  }
  static ready() {
    if (db == null) {
      throw new Error("db not initialized");
    }
  }
  async create(
    parent: BlockView | null,
    data: Data,
    key: PrivateKey,
  ): Promise<BlockView> {
    let rcid = null;
    let pcid = null;
    let seq = 0;
    if (parent != null) {
      let value = parent.value as BaseBlock;
      rcid = value.root || parent.cid;
      pcid = parent.cid;
      seq = value.seq + 1;
    }
    let unsigned = await encode({
      value: { parent: pcid, seq, data },
      codec,
      hasher,
    });
    let hash = unsigned.cid;
    let sig = await key.sign(hash.bytes);
    let signed = await encode({
      value: {
        root: rcid,
        parent: pcid,
        seq,
        data,
        hash,
        sig,
      } as BaseBlock,
      codec,
      hasher,
    });
    ChainStore.ready();
    await db?.blockstore?.put(signed.cid, signed.bytes);
    return signed;
  }
  async get(cid: CID.CID): Promise<BlockView | undefined> {
    let bytes = await db?.blockstore?.get(cid);
    if (bytes === undefined) {
      return undefined;
    }
    return await decode({ bytes, codec, hasher });
  }
}
