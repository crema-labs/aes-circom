import { WitnessTester } from "circomkit";
import { circomkit } from "./common";
import { encryptAesEcbNoPadding, Block4x4 } from '../tinyAes';

// todo: should debug cipher
describe("Cipher", () => {
  let circuit: WitnessTester<["block", "key"], ["cipher"]>;
  it("should perform Cipher#1", async () => {
    circuit = await circomkit.WitnessTester(`Cipher`, {
      file: "cipher",
      template: "Cipher",
      params: [4],
    });
    console.log("@Cipher #constraints:", await circuit.getConstraintCount());

    const block: Block4x4 = [
      [0x32, 0x88, 0x31, 0xe0],
      [0x43, 0x5a, 0x31, 0x37],
      [0xf6, 0x30, 0x98, 0x07],
      [0xa8, 0x8d, 0xa2, 0x34],
    ];

    const key = [0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c];

    const cipher = await encryptAesEcbNoPadding(key, block);

    await circuit.expectPass({block, key}, {cipher});
  });

  // in  : f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff
  // out : ec8cdf7398607cb0f2d21675ea9ea1e4
  // key : 2b7e151628aed2a6abf7158809cf4f3c
  it("should perform Cipher#2", async () => {
    circuit = await circomkit.WitnessTester(`Cipher`, {
      file: "cipher",
      template: "Cipher",
      params: [4],
    });
    console.log("@Cipher #constraints:", await circuit.getConstraintCount());

    const block: Block4x4 = [
      [0xf0, 0xf4, 0xf8, 0xfc],
      [0xf1, 0xf5, 0xf9, 0xfd],
      [0xf2, 0xf6, 0xfa, 0xfe],
      [0xf3, 0xf7, 0xfb, 0xff],
    ];

    const key = [0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c];

    const cipher = await encryptAesEcbNoPadding(key, block);

    await circuit.expectPass({block, key}, {cipher});
  });
});
