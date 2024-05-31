import { kadDHT, removePrivateAddressesMapper } from "@libp2p/kad-dht";
import { IDBBlockstore } from "blockstore-idb";
import { Encoder, Decoder } from "cbor-web";
import { CID } from "multiformats";
import { lpStream } from "it-length-prefixed-stream";
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
import { webSockets } from "@libp2p/websockets";
import { webTransport } from "@libp2p/webtransport";
import { webRTC, webRTCDirect } from "@libp2p/webrtc";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
import { ChainStore } from "./chain";

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

const SYNC_PROTOCOL = "/amendment-zero/sync/1";
type SyncRequest = {
  root: CID;
  head: CID;
};

export class Network {
  private _libp2p: Libp2p | null = null;
  private _helia: Helia | null = null;
  async syncHandler(data: IncomingStreamData) {
    const stream = lpStream(data.stream);
    let msg = (await stream.read()).subarray();
    let req = (await Decoder.decodeFirst(msg)) as SyncRequest;
    let prev = req.head;
    let next = await ChainStore.child(prev);
    while (next) {
      prev = next.cid;
      await stream.write(ChainStore.serialize(next));
    }
  }
  async sync(peer: PeerId, root: CID, head: CID) {
    let req = Encoder.encode({
      root: root.bytes,
      head: head.bytes,
    });
    const stream = lpStream(
      await this.libp2p.dialProtocol(peer, SYNC_PROTOCOL),
    );
    stream.write(req);
    let next = (await stream.read()).subarray();
    while (next.length > 0) {
      let block = ChainStore.deserialize(next);
    }
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
  async addFile(bytes: Uint8Array) {
    const fs = unixfs(this.helia);
    const cid = await fs.addBytes(bytes);
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
  async init() {
    const blockstore = new IDBBlockstore("blocks");
    const datastore = new IDBDatastore("libp2p");
    await datastore.open();
    await blockstore.open();
    ChainStore.init(blockstore);

    // Enable verbose logging for debugging
    localStorage.debug = "*";

    const delegatedClient = createDelegatedRoutingV1HttpApiClient(
      "https://delegated-ipfs.dev",
    );

    const { bootstrapAddrs, relayListenAddrs } =
      await getBootstrapMultiaddrs(delegatedClient);

    this._libp2p = await createLibp2p({
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
    });
    this._helia = await createHelia({
      datastore,
      blockstore,
      libp2p: this._libp2p,
    });
    if (this._libp2p.status == "starting") {
      await this._libp2p.start();
    }
    await this._helia.start();
    console.log("started");
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
