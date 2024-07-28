import { WitnessTester } from "circomkit";
import { circomkit } from "./common";

// todo: should debug cipher
describe("Cipher", () => {
  let circuit: WitnessTester<["block", "key"], ["cipher"]>;
  it("should perform Cipher", async () => {
    circuit = await circomkit.WitnessTester(`Cipher`, {
      file: "cipher",
      template: "Cipher",
      params: [4],
    });
    console.log("@Cipher #constraints:", await circuit.getConstraintCount());

    // 0x57 . 2 = 0xae
    await circuit.expectPass(
      {
        block: [
          [0x32, 0x88, 0x31, 0xe0],
          [0x43, 0x5a, 0x31, 0x37],
          [0xf6, 0x30, 0x98, 0x07],
          [0xa8, 0x8d, 0xa2, 0x34],
        ],
        key: [0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c],
      },
      {
        cipher: [
          [0x39, 0x02, 0xdc, 0x19],
          [0x25, 0xdc, 0x11, 0x6a],
          [0x84, 0x09, 0x85, 0x0b],
          [0x1d, 0xfb, 0x97, 0x32],
        ],
      }
    );
  });
});
