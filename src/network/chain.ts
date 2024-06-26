import {
  generateKeyPair,
  Ed25519PrivateKey,
  unmarshalPrivateKey,
  marshalPrivateKey,
} from "@libp2p/crypto/keys";
import { Ed25519 } from "@libp2p/interface";
import { IDBBlockstore } from "blockstore-idb";
import { CID, MultihashDigest } from "multiformats";
import { sha256 } from "multiformats/hashes/sha2";
import { PrivateKey, PublicKey } from "@libp2p/interface";
import { Encoder, Decoder } from "cbor-web";

let db: ChainStore | null = null;

export type Data = GenesisBlock | ImportAsset | SendAsset | AcceptAsset;
export type GenesisBlock = {
  type: "Genesis";
  key: PublicKey;
};
export type ImportAsset = {
  type: "Import";
  chain: "RSK";
  block_height: number;
  tx_hash: string;
  sender_address: string;
  to_address: string;
  asset: CID;
};
export type SendAsset = {
  type: "Send";
  sender_address: CID;
  receiver_address: CID;
  asset: CID;
};
export type AcceptAsset = {
  type: "Accept";
  sender_address: CID;
  receiver_address: CID;
  asset: CID;
};
export type BaseBlock = {
  root: CID<unknown, 113, 18, 1> | null;
  block_type: "Genesis" | "Import" | "Send" | "Accept";
  parent: CID<unknown, 113, 18, 1> | null;
  seq: number;
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
  metadata: IDBDatabase | null = null;
  static async init(blockstore: IDBBlockstore) {
    let self = new ChainStore();
    self.blockstore = blockstore;
    const metadata = indexedDB.open("metadata", 4);
    self.metadata = await new Promise((resolve, reject) => {
      metadata.onerror = (event) => {
        reject(`Database error: ${metadata.error}`);
      };

      metadata.onsuccess = (event) => {
        resolve(metadata.result);
      };

      metadata.onupgradeneeded = (event) => {
        self.metadata = metadata.result;
        if (!self.metadata.objectStoreNames.contains("roots")) {
          self.metadata.createObjectStore("roots", { keyPath: "id" });
        }
        if (!self.metadata.objectStoreNames.contains("keys")) {
          self.metadata.createObjectStore("keys", { keyPath: "id" });
        }
        if (!self.metadata.objectStoreNames.contains("child")) {
          self.metadata.createObjectStore("child", { keyPath: "parent" });
        }
        if (!self.metadata.objectStoreNames.contains("self")) {
          self.metadata.createObjectStore("self", { keyPath: "id" });
        }
      };
    });
    db = self;
  }
  static async activeAssets(): Promise<CID[]> {
    let assets: CID[] = [];
    let parent = await this.genesis();
    if (parent == null) {
      return assets;
    }
    let child = await this.child(parent.cid);
    while (child != null) {
      if (child.block_type == "Accept" || child.block_type == "Import") {
        let data = child.data as any;
        assets.push(data.asset);
      }
    }
    return assets;
  }

  static async putGenesis(root: CID) {
    let operation = db?.metadata
      ?.transaction("self", "readwrite")
      .objectStore("self")
      .put({ id: "genesis", root: root.bytes });
    if (!operation) {
      throw new Error("no metadata db");
    }
    return await new Promise((resolve, reject) => {
      operation.onsuccess = () => {
        resolve(null);
      };

      operation.onerror = () => {
        reject(`Add data error: ${operation.error}`);
      };
    });
  }

  static async genesis(): Promise<BaseBlock | null> {
    let operation = db?.metadata
      ?.transaction("self")
      .objectStore("self")
      .get("genesis");
    if (!operation) {
      throw new Error("no metadata db");
    }
    let result = (await new Promise((resolve, reject) => {
      operation.onsuccess = () => {
        if (operation.result == null) {
          resolve(null);
        } else {
          resolve(operation.result.root as Uint8Array);
        }
      };

      operation.onerror = () => {
        reject();
      };
    })) as Uint8Array | null;
    if (result == null) {
      return null;
    }
    let [cid] = CID.decodeFirst(result);
    let block = await this.get(cid);
    if (block == null) {
      throw new Error("missing genesis block");
    }
    return block;
  }
  static async putRoots(roots: CID[]) {
    let operation = db?.metadata
      ?.transaction("roots", "readwrite")
      .objectStore("roots")
      .put({ id: "roots", roots: roots.map((root) => root.bytes) });
    if (!operation) {
      throw new Error("no metadata db");
    }
    return await new Promise((resolve, reject) => {
      operation.onsuccess = () => {
        resolve(null);
      };

      operation.onerror = () => {
        reject(`Add data error: ${operation.error}`);
      };
    });
  }
  static async roots(): Promise<CID[]> {
    let operation = db?.metadata
      ?.transaction("roots")
      .objectStore("roots")
      .get("roots");
    if (!operation) {
      throw new Error("no metadata db");
    }
    let result = (await new Promise((resolve, reject) => {
      operation.onsuccess = () => {
        if (operation.result == null) {
          resolve([]);
        } else {
          resolve(operation.result.roots as Uint8Array[]);
        }
      };

      operation.onerror = () => {
        reject();
      };
    })) as Uint8Array[];
    return result.map((root) => {
      let [cid] = CID.decodeFirst(root);
      return cid;
    });
  }
  static async putKey(key: PrivateKey) {
    let operation = db?.metadata
      ?.transaction("keys", "readwrite")
      .objectStore("keys")
      .put({ id: "key", key: marshalPrivateKey(key) });
    if (!operation) {
      throw new Error("no metadata db");
    }
    return await new Promise((resolve, reject) => {
      operation.onsuccess = () => {
        resolve(null);
      };

      operation.onerror = () => {
        reject(`Add data error: ${operation.error}`);
      };
    });
  }
  static async key(): Promise<PrivateKey> {
    let operation = db?.metadata
      ?.transaction("keys")
      .objectStore("keys")
      .get("key");
    if (!operation) {
      throw new Error("no metadata db");
    }
    let result = (await new Promise((resolve, reject) => {
      operation.onsuccess = () => {
        if (operation.result == null) {
          resolve(null);
        } else {
          let key = operation.result.key;
          resolve(unmarshalPrivateKey(key));
        }
      };

      operation.onerror = () => {
        reject();
      };
    })) as PrivateKey | null;
    if (result == null) {
      result = await generateKeyPair(Ed25519);
      this.putKey(result);
    }
    return result;
  }
  static ready() {
    if (db == null) {
      throw new Error("db not initialized");
    }
  }
  static serialize(block: BaseBlock): Uint8Array {
    let serializedData = new Uint8Array(0);
    if (block.data.type === "Genesis") {
      serializedData = Encoder.encode({
        type: block.data.type,
        key: marshalPrivateKey(block.data.key),
      });
    } else if (block.data.type === "Import") {
      serializedData = Encoder.encode({
        type: block.data.type,
        chain: block.data.chain,
        block_height: block.data.block_height,
        tx_hash: block.data.tx_hash,
        sender_address: block.data.sender_address,
        to_address: block.data.to_address,
        asset: block.data.asset.bytes,
      });
    } else if (block.data.type === "Accept") {
      serializedData = Encoder.encode({
        type: block.data.type,
        sender_address: block.data.sender_address.bytes,
        receiver_address: block.data.receiver_address.bytes,
        asset: block.data.asset.bytes,
      });
    } else if (block.data.type === "Send") {
      serializedData = Encoder.encode({
        type: block.data.type,
        sender_address: block.data.sender_address.bytes,
        receiver_address: block.data.receiver_address.bytes,
        asset: block.data.asset.bytes,
      });
    }
    throw new Error("unexpected blocktype");
  }
  static async deserialize(bytes: Uint8Array): Promise<BaseBlock> {
    let block = await Decoder.decodeFirst(bytes);
    if (block.root) {
      let [cid] = CID.decodeFirst(block.root);
      block.root = cid;
    }
    if (block.parent) {
      let [cid] = CID.decodeFirst(block.parent);
      block.parent = cid;
    }
    if (block.cid) {
      let [cid] = CID.decodeFirst(block.cid);
      block.cid = cid;
    }
    let data = await Decoder.decodeFirst(block.data);
    if (block.data_type === "Genesis") {
      data.key = await unmarshalPrivateKey(data.key);
    } else if (block.data_type === "Import") {
      let [cid] = CID.decodeFirst(block.cid);
      data.asset.cid = cid;
    } else if (block.data_type === "Accept") {
      let [sender_address] = CID.decodeFirst(block.sender_address);
      block.sender_address = sender_address;
      let [receiver_address] = CID.decodeFirst(block.receiver_address);
      block.receiver_address = receiver_address;
      let [contract] = CID.decodeFirst(block.contract);
      block.contract = contract;
      let [asset] = CID.decodeFirst(block.asset);
      block.asset = asset;
    } else if (block.data_type === "Send") {
      let [sender_address] = CID.decodeFirst(block.sender_address);
      block.sender_address = sender_address;
      let [receiver_address] = CID.decodeFirst(block.receiver_address);
      block.receiver_address = receiver_address;
      let [contract] = CID.decodeFirst(block.contract);
      block.contract = contract;
      let [asset] = CID.decodeFirst(block.asset);
      block.asset = asset;
    }
    block.data = data;
    return block as BaseBlock;
  }
  static async insert(block: BaseBlock) {
    // TODO: verify root, seq, cid, hash and signature
    await db?.blockstore?.put(
      block.cid,
      Encoder.encode({
        root: block.root,
        parent: block.parent,
        seq: block.seq,
        block_type: block.block_type,
        data: block.data,
        hash: block.hash,
        sig: block.sig,
      }),
    );
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
      block_type: data.type,
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
    if (block.root == null) {
      let roots = await this.roots();
      roots.push(block.cid);
      await this.putRoots(roots);
    }
    if (block.parent != null) {
      await this.putChild(block.parent, block.cid);
    }
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
    signed.cid = (await cid(new Uint8Array(bytes))) as CID<unknown, 113, 18, 1>;
    let block = signed as BaseBlock;
    return block;
  }
  static async putChild(parent: CID, child: CID) {
    let operation = db?.metadata
      ?.transaction("child", "readwrite")
      .objectStore("child")
      .put({ parent: parent.toString(), child: child.bytes });
    if (!operation) {
      throw new Error("no metadata db");
    }
    return await new Promise((resolve, reject) => {
      operation.onsuccess = () => {
        resolve(null);
      };

      operation.onerror = () => {
        reject(`Add data error: ${operation.error}`);
      };
    });
  }
  static async child(parent: CID): Promise<BaseBlock | undefined> {
    let operation = db?.metadata
      ?.transaction("child")
      .objectStore("child")
      .get(parent.toString());
    if (!operation) {
      throw new Error("no metadata db");
    }
    let result = (await new Promise((resolve, reject) => {
      operation.onsuccess = () => {
        if (operation.result == null) {
          resolve(undefined);
        } else {
          resolve(
            operation.result as {
              child: Uint8Array;
            },
          );
        }
      };

      operation.onerror = (event) => {
        const error = (event.target as IDBRequest).error;
        reject(error);
      };
    })) as
      | {
          child: Uint8Array;
        }
      | undefined;
    if (result == undefined) {
      return result;
    }
    let [child] = CID.decodeFirst(result.child);
    return await this.get(child);
  }
  static async getAllBlocks(): Promise<BaseBlock[]> {
    const genesisBlock = await this.genesis();
    if (!genesisBlock) {
      throw new Error("No genesis block found");
    }

    const allBlocks: BaseBlock[] = [];
    await this.traverseBlocks(genesisBlock, allBlocks);

    return allBlocks;
  }

  private static async traverseBlocks(
    block: BaseBlock,
    allBlocks: BaseBlock[],
  ): Promise<void> {
    allBlocks.push(block);

    const child = await this.child(block.cid);
    if (child) {
      await this.traverseBlocks(child, allBlocks);
    }
  }
}
