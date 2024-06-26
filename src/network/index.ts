import {
  KadDHT,
  kadDHT,
  removePrivateAddressesMapper,
  EventTypes,
  ProviderEvent,
} from "@libp2p/kad-dht";
import { peerIdFromKeys } from "@libp2p/peer-id";
import { IDBBlockstore } from "blockstore-idb";
import { Encoder, Decoder } from "cbor-web";
import { lpStream } from "it-length-prefixed-stream";
import {
  generateKeyPair,
  marshalPrivateKey,
  unmarshalPrivateKey,
} from "@libp2p/crypto/keys";
import {
  createDelegatedRoutingV1HttpApiClient,
  DelegatedRoutingV1HttpApiClient,
} from "@helia/delegated-routing-v1-http-api-client";
import { createLibp2p, Libp2p } from "libp2p";
import { identify } from "@libp2p/identify";
import { peerIdFromString } from "@libp2p/peer-id";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import first from "it-first";
import { bootstrap } from "@libp2p/bootstrap";
import { Multiaddr } from "@multiformats/multiaddr";
import type {
  Connection,
  Message,
  SignedMessage,
  PeerId,
  IncomingStreamData,
} from "@libp2p/interface";
import { Ed25519 } from "@libp2p/interface";
import { webSockets } from "@libp2p/websockets";
import { webTransport } from "@libp2p/webtransport";
import { webRTC, webRTCDirect } from "@libp2p/webrtc";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
import {
  ChainStore,
  GenesisBlock,
  BaseBlock,
  SendAsset,
  AcceptAsset,
} from "./chain";

const WEBRTC_BOOTSTRAP_PEER_ID =
  "12D3KooWGahRw3ZnM4gAyd9FK75v4Bp5keFYTvkcAwhpEm28wbV3";
const WEBTRANSPORT_BOOTSTRAP_PEER_ID =
  "12D3KooWFhXabKDwALpzqMbto94sB7rvmZ6M28hs9Y9xSopDKwQr";
const BOOTSTRAP_PEER_IDS = [
  WEBTRANSPORT_BOOTSTRAP_PEER_ID,
  WEBRTC_BOOTSTRAP_PEER_ID,
];
import { Helia, createHelia } from "helia";
import { IDBDatastore } from "datastore-idb";
import { unixfs } from "@helia/unixfs";
import { CID } from "multiformats";

const SYNC_PROTOCOL = "/amendment-zero/sync/1";
type SyncRequest = {
  root: CID;
  head: CID | null;
};

const SEND_PROTOCOL = "/amendment-zero/send/1";
type SendRequest = {
  sender_address: CID;
  receiver_address: CID;
  contract: CID;
  asset: CID;
};
type SendResponse = {
  result: "Accept" | "Decline";
};

export class Network {
  private _libp2p: Libp2p | null = null;
  private _helia: Helia | null = null;
  async sendHandler(data: IncomingStreamData) {
    const stream = lpStream(data.stream);
    let msg = (await stream.read()).subarray();
    let req = (await Decoder.decodeFirst(msg)) as SendRequest;
    await this.getFile(req.asset);
    let parent = await ChainStore.get(req.receiver_address);
    if (parent == undefined) {
      data.stream.abort(Error("Invalid Receiver Address"));
      return;
    }
    let child = await ChainStore.child(parent.cid);
    while (child) {
      parent = child;
      child = await ChainStore.child(parent.cid);
    }
    let key_bytes = this.libp2p.peerId.privateKey;
    if (key_bytes == undefined) {
      throw new Error("No private key");
    }
    let key = await unmarshalPrivateKey(key_bytes);
    ChainStore.create(
      parent,
      {
        type: "Accept",
        ...req,
      },
      key,
    );
  }
  async send(sender: CID, receiver: CID, contract: CID, asset: CID) {
    let req = Encoder.encode({
      sender: sender.bytes,
      receiver: receiver.bytes,
      contract: contract.bytes,
      asset: asset.bytes,
    });
    let head = this.syncAll(receiver, null);
    if (head == null) {
      throw new Error("failed to sync chain");
    }
    let root = await ChainStore.get(receiver);
    if (root == null) {
      throw new Error("failed to sync chain");
    }
    let genesis = root.data as GenesisBlock;
    let key = genesis.key;
    let peer = await peerIdFromKeys(marshalPrivateKey(key));
    const stream = lpStream(
      await this.libp2p.dialProtocol(peer, SYNC_PROTOCOL),
    );
    stream.write(req);
    let msg = (await stream.read()).subarray();
    let resp = (await Decoder.decodeFirst(msg)) as SendResponse;
    return resp.result;
  }
  async syncHandler(data: IncomingStreamData) {
    const stream = lpStream(data.stream);
    let msg = (await stream.read()).subarray();
    let req = (await Decoder.decodeFirst(msg)) as SyncRequest;
    let prev = req.head;
    if (prev == null) {
      let block = await ChainStore.get(req.root);
      if (block == null) {
        return;
      }
      await stream.write(ChainStore.serialize(block));
      prev = block.cid;
    }
    let next = await ChainStore.child(prev);
    while (next) {
      prev = next.cid;
      await stream.write(ChainStore.serialize(next));
    }
  }
  async syncAll(root: CID, head: CID | null): Promise<CID | null> {
    let cid = head;
    let dht = this.libp2p.services.dht as KadDHT;
    for await (const event of dht.findProviders(root)) {
      if (event.type != EventTypes.PROVIDER) {
        continue;
      }
      let provider_event = event as ProviderEvent;
      for (let provider of provider_event.providers) {
        cid = await this.sync(provider.id, root, cid);
      }
    }
    return cid;
  }
  async sync(peer: PeerId, root: CID, head: CID | null): Promise<CID | null> {
    let req = Encoder.encode({
      root: root.bytes,
      head: head?.bytes,
    });
    const stream = lpStream(
      await this.libp2p.dialProtocol(peer, SYNC_PROTOCOL),
    );
    stream.write(req);
    let next = (await stream.read()).subarray();
    let cid = head;
    while (next.length > 0) {
      let block = await ChainStore.deserialize(next);
      ChainStore.insert(block);
      cid = block.cid;
    }
    return cid;
  }
  get libp2p(): Libp2p {
    if (this._libp2p == null) {
      throw new Error("Network not initalized");
    }
    return this._libp2p;
  }
  get helia(): Helia {
    if (this._helia == null) {
      throw new Error("Network not initalized");
    }
    return this._helia;
  }
  async addFile(bytes: Uint8Array): Promise<CID> {
    const fs = unixfs(this.helia);
    const cid = await fs.addBytes(bytes);

    return cid;
  }
  async getFile(cid: CID): Promise<Uint8Array> {
    const fs = unixfs(this.helia);
    let result = new Uint8Array(0);
    for await (const chunk of fs.cat(cid)) {
      let target = new Uint8Array(result.length + chunk.length);
      target.set(result, 0);
      target.set(chunk, result.length);
      result = target;
    }
    return result;
  }
  async exportAsset(asset: CID) {
    let pkey = await generateKeyPair(Ed25519);
    let data = {
      pkey,
      blocks: [] as BaseBlock[],
    };
    let newchain = await ChainStore.create(
      null,
      { type: "Genesis", key: pkey.public },
      pkey,
    );
    let genesis = (await ChainStore.genesis()) as BaseBlock | null | undefined;
    if (genesis == null) {
      throw new Error("");
    }
    data.blocks.push(genesis);
    let transfer = await ChainStore.create(
      newchain,
      {
        type: "Accept",
        sender_address: genesis.cid,
        receiver_address: newchain.cid,
        asset,
      },
      await ChainStore.key(),
    );
    let block = await ChainStore.child(genesis.cid);
    while (true) {
      if (block == null) {
        break;
      }
      data.blocks.push(block);
      block = await ChainStore.child(block.cid);
    }
    let send = await ChainStore.create(
      genesis,
      {
        type: "Send",
        sender_address: genesis.cid,
        receiver_address: newchain.cid,
        asset,
      },
      pkey,
    );
    data.blocks.push(send);
    data.blocks.push(newchain);
    data.blocks.push(transfer);
    let dump = JSON.stringify(data);
    console.log(dump);
    const blob = new Blob([dump], { type: "text/plaintext" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "provenance.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  async init() {
    const blockstore = new IDBBlockstore("blocks");
    const datastore = new IDBDatastore("libp2p");
    await datastore.open();
    await blockstore.open();
    await ChainStore.init(blockstore);

    // Enable verbose logging for debugging
    localStorage.debug = "ui*";

    const delegatedClient = createDelegatedRoutingV1HttpApiClient(
      "https://delegated-ipfs.dev",
    );

    const { bootstrapAddrs, relayListenAddrs } =
      await getBootstrapMultiaddrs(delegatedClient);

    let key = await ChainStore.key();
    let peerId = await peerIdFromKeys(key.public.bytes, key.bytes);

    if ((await ChainStore.genesis()) == null) {
      let block = await ChainStore.create(
        null,
        { type: "Genesis", key: key.public },
        key,
      );
      await ChainStore.putGenesis(block.cid);
    }

    let config = {
      peerId,
      datastore,
      addresses: {
        listen: [
          // Listen for webRTC connection
          "/webrtc",
          // TODO: Use the app's bootstrap nodes as circuit relays
          ...relayListenAddrs,
        ],
      },
      transports: [
        webTransport(),
        webSockets(),
        webRTC({
          rtcConfiguration: {
            iceServers: [
              {
                // STUN servers help the browser discover its own public IPs
                urls: [
                  "stun:stun.l.google.com:19302",
                  "stun:global.stun.twilio.com:3478",
                ],
              },
            ],
          },
        }),
        // Required to estalbish connections with peers supporting WebRTC-direct, e.g. the Rust-peer
        webRTCDirect(),
        // Required to create circuit relay reservations in order to hole punch browser-to-browser WebRTC connections
        circuitRelayTransport({
          // When set to >0, this will look up the magic CID in order to discover circuit relay peers it can create a reservation with
          discoverRelays: 2,
        }),
      ],
      connectionManager: {
        maxConnections: 30,
        minConnections: 5,
      },
      connectionEncryption: [noise()],
      streamMuxers: [yamux()],
      connectionGater: {
        denyDialMultiaddr: async () => false,
      },
      peerDiscovery: [
        bootstrap({
          // The app-specific go and rust bootstrappers use WebTransport and WebRTC-direct which have ephemeral multiadrrs
          // that are resolved above using the delegated routing API
          list: bootstrapAddrs,
        }),
      ],
      services: {
        // Delegated routing helps us discover the ephemeral multiaddrs of the dedicated go and rust bootstrap peers
        // This relies on the public delegated routing endpoint https://docs.ipfs.tech/concepts/public-utilities/#delegated-routing
        delegatedRouting: () => delegatedClient,
        identify: identify(),
        dht: kadDHT({
          protocol: "/ipfs/kad/1.0.0",
          peerInfoMapper: removePrivateAddressesMapper,
        }),
      },
    };

    while (true) {
      try {
        this._libp2p = await createLibp2p(config);
        break;
      } catch (e) {}
    }
    if (this._libp2p == null) {
      throw new Error("impossible");
    }
    this._helia = await createHelia({
      datastore,
      blockstore,
      libp2p: this._libp2p,
    });
    if (this._libp2p.status == "starting") {
      await this._libp2p.start();
    }
    await this._helia.start();
  }
}

async function getBootstrapMultiaddrs(
  client: DelegatedRoutingV1HttpApiClient,
): Promise<BootstrapsMultiaddrs> {
  const peers = await Promise.all(
    BOOTSTRAP_PEER_IDS.map((peerId) =>
      first(client.getPeers(peerIdFromString(peerId))),
    ),
  );

  const bootstrapAddrs = [];
  const relayListenAddrs = [];
  for (const p of peers) {
    if (p && p.Addrs.length > 0) {
      for (const maddr of p.Addrs) {
        const protos = maddr.protoNames();
        if (
          (protos.includes("webtransport") ||
            protos.includes("webrtc-direct")) &&
          protos.includes("certhash")
        ) {
          if (maddr.nodeAddress().address === "127.0.0.1") continue; // skip loopback
          bootstrapAddrs.push(maddr.toString());
          relayListenAddrs.push(getRelayListenAddr(maddr, p.ID));
        }
      }
    }
  }
  return { bootstrapAddrs, relayListenAddrs };
}

interface BootstrapsMultiaddrs {
  // Multiaddrs that are dialable from the browser
  bootstrapAddrs: string[];

  // multiaddr string representing the circuit relay v2 listen addr
  relayListenAddrs: string[];
}

// Constructs a multiaddr string representing the circuit relay v2 listen address for a relayed connection to the given peer.
const getRelayListenAddr = (maddr: Multiaddr, peer: PeerId): string =>
  `${maddr.toString()}/p2p/${peer.toString()}/p2p-circuit`;

export const getFormattedConnections = (connections: Connection[]) =>
  connections.map((conn) => ({
    peerId: conn.remotePeer,
    protocols: Array.from(new Set(conn.remoteAddr.protoNames())),
  }));
