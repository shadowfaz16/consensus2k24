import { generateKeyPair } from "@libp2p/crypto/keys";
import { BaseBlock, ChainStore, GenesisBlock } from "./chain";
import { Ed25519 } from "@libp2p/interface";
import { test, expect } from "vitest";
import "fake-indexeddb/auto";

test("test", async () => {
  await ChainStore.init();
  expect(await ChainStore.roots()).toEqual([]);
  console.log("test");
  let private_key_1 = await generateKeyPair(Ed25519);
  let key1 = private_key_1.public;
  let block1 = await ChainStore.create(null, { key: key1 }, private_key_1);
  expect(await ChainStore.roots()).toEqual([block1.cid]);
  let block2 = await ChainStore.create(block1, { key: key1 }, private_key_1);
  expect(await ChainStore.roots()).toEqual([block1.cid]);
  let block3 = await ChainStore.get(block1.cid);
  let block4 = await ChainStore.get(block2.cid);
  expect(block1).toEqual(block3);
  expect(block2).toEqual(block4);
  let private_key_2 = await generateKeyPair(Ed25519);
  let key2 = private_key_2.public;
  let block5 = await ChainStore.create(null, { key: key2 }, private_key_2);
  expect(await ChainStore.roots()).toEqual([block1.cid, block5.cid]);
  await ChainStore.putKey(private_key_1);
  expect(await ChainStore.key()).toEqual(private_key_1);
  await ChainStore.putKey(private_key_2);
  expect(await ChainStore.key()).toEqual(private_key_2);
});
