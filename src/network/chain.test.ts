import { generateKeyPair } from "@libp2p/crypto/keys";
import { BaseBlock, ChainStore, GenesisBlock } from "./chain";
import { Ed25519 } from "@libp2p/interface";
import { test, expect } from "vitest";
import "fake-indexeddb/auto";

test("test", async () => {
  await ChainStore.init();
  let private_key = await generateKeyPair(Ed25519);
  let key = private_key.public;
  let block1 = await ChainStore.create(null, { key }, private_key);
  let block2 = await ChainStore.create(block1, { key }, private_key);
  let block3 = await ChainStore.get(block1.cid);
  let block4 = await ChainStore.get(block2.cid);
  expect(block1).toEqual(block3);
  expect(block2).toEqual(block4);
  console.log("Blockssss:", [block1, block2, block3, block4]);
});
