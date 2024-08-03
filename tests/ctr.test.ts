import { WitnessTester } from "circomkit";
import { circomkit } from "./common";

// todo: should debug cipher
describe("ToBlocks", () => {
  let circuit: WitnessTester<["stream"], ["blocks"]>;
  it("should convert stream to block", async () => {
    circuit = await circomkit.WitnessTester(`ToBlocks`, {
      file: "ctr",
      template: "ToBlocks",
      params: [16],
    });
    console.log("@ToBLocks #constraints:", await circuit.getConstraintCount());

    await circuit.expectPass(
      {
        stream: [0x32, 0x88, 0x31, 0xe0, 0x43, 0x5a, 0x31, 0x37, 0xf6, 0x30, 0x98, 0x07, 0xa8, 0x8d, 0xa2, 0x34],
      },
      {
        blocks: [
          [
            [0x32, 0x43, 0xf6, 0xa8],
            [0x88, 0x5a, 0x30, 0x8d],
            [0x31, 0x31, 0x98, 0xa2],
            [0xe0, 0x37, 0x07, 0x34],
          ],
        ],
      }
    );
  });
  it("should pad 1 in block", async () => {
    circuit = await circomkit.WitnessTester(`ToBlocks`, {
      file: "ctr",
      template: "ToBlocks",
      params: [15],
    });
    console.log("@ToBLocks #constraints:", await circuit.getConstraintCount());

    await circuit.expectPass(
      {
        stream: [0x32, 0x88, 0x31, 0xe0, 0x43, 0x5a, 0x31, 0x37, 0xf6, 0x30, 0x98, 0x07, 0xa8, 0x8d, 0xa2],
      },
      {
        blocks: [
          [
            [0x32, 0x43, 0xf6, 0xa8],
            [0x88, 0x5a, 0x30, 0x8d],
            [0x31, 0x31, 0x98, 0xa2],
            [0xe0, 0x37, 0x07, 0x01],
          ],
        ],
      }
    );
  });
  it("should pad 0's in block", async () => {
    circuit = await circomkit.WitnessTester(`ToBlocks`, {
      file: "ctr",
      template: "ToBlocks",
      params: [14],
    });
    console.log("@ToBLocks #constraints:", await circuit.getConstraintCount());

    await circuit.expectPass(
      {
        stream: [0x32, 0x88, 0x31, 0xe0, 0x43, 0x5a, 0x31, 0x37, 0xf6, 0x30, 0x98, 0x07, 0xa8, 0x8d],
      },
      {
        blocks: [
          [
            [0x32, 0x43, 0xf6, 0xa8],
            [0x88, 0x5a, 0x30, 0x8d],
            [0x31, 0x31, 0x98, 0x01],
            [0xe0, 0x37, 0x07, 0x00],
          ],
        ],
      }
    );
  });
  it("should generate enough blocks", async () => {
    circuit = await circomkit.WitnessTester(`ToBlocks`, {
      file: "ctr",
      template: "ToBlocks",
      params: [17],
    });
    console.log("@ToBLocks #constraints:", await circuit.getConstraintCount());

    await circuit.expectPass(
      {
        stream: [0x32, 0x88, 0x31, 0xe0, 0x42, 0x5a, 0x31, 0x37, 0xf6, 0x30, 0x98, 0x07, 0xa8, 0x8d, 0xa2, 0x34, 0x12],
      },
      {
        blocks: [
          [
            [0x32, 0x42, 0xf6, 0xa8],
            [0x88, 0x5a, 0x30, 0x8d],
            [0x31, 0x31, 0x98, 0xa2],
            [0xe0, 0x37, 0x07, 0x34],
          ],
          [
            [0x12, 0x00, 0x00, 0x00],
            [0x01, 0x00, 0x00, 0x00],
            [0x00, 0x00, 0x00, 0x00],
            [0x00, 0x00, 0x00, 0x00],
          ],
        ],
      }
    );
  });
});

describe("EncryptCTR", () => {
  let circuit: WitnessTester<["plainText", "iv", "key"], ["cipher"]>;
  it("should encrypt 1 block correctly", async () => {
    circuit = await circomkit.WitnessTester(`EncryptCTR`, {
      file: "ctr",
      template: "EncryptCTR",
      params: [16, 4],
    });
    console.log("@ToBLocks #constraints:", await circuit.getConstraintCount());

    await circuit.expectPass(
      {
        plainText: [0x6b, 0xc1, 0xbe, 0xe2, 0x2e, 0x40, 0x9f, 0x96, 0xe9, 0x3d, 0x7e, 0x11, 0x73, 0x93, 0x17, 0x2a],
        iv: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff],
        key: [0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c],
      },
      {
        cipher: [0x87, 0x4d, 0x61, 0x91, 0xb6, 0x20, 0xe3, 0x26, 0x1b, 0xef, 0x68, 0x64, 0x99, 0x0d, 0xb6, 0xce],
      }
    );
  });

  // test vectors borrowed from https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Standards-and-Guidelines/documents/examples/AES_CTR.pdf
  // Key is
  // 2B7E1516 28AED2A6 ABF71588 09CF4F3C
  // Plaintext is
  // 6BC1BEE2 2E409F96 E93D7E11 7393172A
  // AE2D8A57 1E03AC9C 9EB76FAC 45AF8E51
  // 30C81C46 A35CE411 E5FBC119 1A0A52EF
  // F69F2445 DF4F9B17 AD2B417B E66C3710

  // Cipher text is
  // 874D6191 B620E326 1BEF6864 990DB6CE
  // 9806F66B 7970FDFF 8617187B B9FFFDFF
  // 5AE4DF3E DBD5D35E 5B4F0902 0DB03EAB
  // 1E031DDA 2FBE03D1 792170A0 F3009CEE
  it("should encrypt multiple blocks correctly", async () => {
    circuit = await circomkit.WitnessTester(`EncryptCTR`, {
      file: "ctr",
      template: "EncryptCTR",
      params: [64, 4],
    });
    console.log("@EncryptCTR #constraints:", await circuit.getConstraintCount());

    await circuit.expectPass(
      {
        plainText: [
          0x6b, 0xc1, 0xbe, 0xe2, 0x2e, 0x40, 0x9f, 0x96, 0xe9, 0x3d, 0x7e, 0x11, 0x73, 0x93, 0x17, 0x2a, 0xae, 0x2d,
          0x8a, 0x57, 0x1e, 0x03, 0xac, 0x9c, 0x9e, 0xb7, 0x6f, 0xac, 0x45, 0xaf, 0x8e, 0x51,
          0x30, 0xc8, 0x1c, 0x46, 0xa3, 0x5c, 0xe4, 0x11, 0xe5, 0xfb, 0xc1, 0x19, 0x1a, 0x0a, 0x52, 0xef,
          0xf6, 0x9f, 0x24, 0x45, 0xdf, 0x4f, 0x9b, 0x17, 0xad, 0x2b, 0x41, 0x7b, 0xe6, 0x6c, 0x37, 0x10,
        ],
        iv: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff],
        key: [0x2b, 0x7e, 0x15, 0x16, 0x28, 0xae, 0xd2, 0xa6, 0xab, 0xf7, 0x15, 0x88, 0x09, 0xcf, 0x4f, 0x3c],
      },
      {
        cipher: [
          0x87, 0x4d, 0x61, 0x91, 0xb6, 0x20, 0xe3, 0x26, 0x1b, 0xef, 0x68, 0x64, 0x99, 0x0d, 0xb6, 0xce, 0x98, 0x06,
          0xf6, 0x6b, 0x79, 0x70, 0xfd, 0xff, 0x86, 0x17, 0x18, 0x7b, 0xb9, 0xff, 0xfd, 0xff,
          0x5a, 0xe4, 0xdf, 0x3e, 0xdb, 0xd5, 0xd3, 0x5e, 0x5b, 0x4f, 0x09, 0x02, 0x0d, 0xb0, 0x3e, 0xab,
          0x1e, 0x03, 0x1d, 0xda, 0x2f, 0xbe, 0x03, 0xd1, 0x79, 0x21, 0x70, 0xa0, 0xf3, 0x00, 0x9c, 0xee,
        ],
      }
    );
  });
});

describe("ToStream", () => {
  let circuit: WitnessTester<["blocks"], ["stream"]>;
  it("should convert blocks to stream#1", async () => {
    circuit = await circomkit.WitnessTester(`ToStream`, {
      file: "ctr",
      template: "ToStream",
      params: [1, 16],
    });
    console.log("@ToStream #constraints:", await circuit.getConstraintCount());

    await circuit.expectPass(
      {
        blocks: [
          [
            [0x32, 0x43, 0xf6, 0xa8],
            [0x88, 0x5a, 0x30, 0x8d],
            [0x31, 0x31, 0x98, 0xa2],
            [0xe0, 0x37, 0x07, 0x34],
          ],
        ],
      },
      {
        stream: [0x32, 0x88, 0x31, 0xe0, 0x43, 0x5a, 0x31, 0x37, 0xf6, 0x30, 0x98, 0x07, 0xa8, 0x8d, 0xa2, 0x34],
      }
    );
  });
  it("should convert blocks to stream#2", async () => {
    circuit = await circomkit.WitnessTester(`ToStream`, {
      file: "ctr",
      template: "ToStream",
      params: [1, 15],
    });
    console.log("@ToStream #constraints:", await circuit.getConstraintCount());

    await circuit.expectPass(
      {
        blocks: [
          [
            [0x32, 0x43, 0xf6, 0xa8],
            [0x88, 0x5a, 0x30, 0x8d],
            [0x31, 0x31, 0x98, 0xa2],
            [0xe0, 0x37, 0x07, 0x01],
          ],
        ],
      },
      {
        stream: [0x32, 0x88, 0x31, 0xe0, 0x43, 0x5a, 0x31, 0x37, 0xf6, 0x30, 0x98, 0x07, 0xa8, 0x8d, 0xa2],
      }
    );
  });
  it("should convert multiple blocks to stream", async () => {
    circuit = await circomkit.WitnessTester(`ToStream`, {
      file: "ctr",
      template: "ToStream",
      params: [2, 18],
    });
    console.log("@ToStream #constraints:", await circuit.getConstraintCount());

    await circuit.expectPass(
      {
        blocks: [
          [
            [0x32, 0x43, 0xf6, 0xa8],
            [0x88, 0x5a, 0x30, 0x8d],
            [0x31, 0x31, 0x98, 0xa2],
            [0xe0, 0x37, 0x07, 0x01],
          ],
          [
            [0x32, 0x43, 0xf6, 0xa8],
            [0x88, 0x5a, 0x30, 0x8d],
            [0x31, 0x31, 0x98, 0xa2],
            [0xe0, 0x37, 0x07, 0x01],
          ],
        ],
      },
      {
        stream: [
          0x32, 0x88, 0x31, 0xe0, 0x43, 0x5a, 0x31, 0x37, 0xf6, 0x30, 0x98, 0x07, 0xa8, 0x8d, 0xa2, 0x01, 0x32, 0x88,
        ],
      }
    );
  });
});

describe("GenerateCounterBlocks", async () => {
  let circuit: WitnessTester<["iv"], ["counterBlocks"]>;
  it("should generate counter blocks correctly", async () => {
    circuit = await circomkit.WitnessTester(`GenerateCounterBlocks`, {
      file: "ctr",
      template: "GenerateCounterBlocks",
      params: [4],
    });
    console.log("@GenerateCounterBlocks #constraints:", await circuit.getConstraintCount());

    await circuit.expectPass(
      {
        iv: [0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff],
      },
      {
        counterBlocks: [
          [
            [0xf0, 0xf4, 0xf8, 0xfc],
            [0xf1, 0xf5, 0xf9, 0xfd],
            [0xf2, 0xf6, 0xfa, 0xfe],
            [0xf3, 0xf7, 0xfb, 0xff],
          ],
          [
            [0xf0, 0xf4, 0xf8, 0xfc],
            [0xf1, 0xf5, 0xf9, 0xfd],
            [0xf2, 0xf6, 0xfa, 0xfe],
            [0xf3, 0xf7, 0xfb, 0x00],
          ],
          [
            [0xf0, 0xf4, 0xf8, 0xfc],
            [0xf1, 0xf5, 0xf9, 0xfd],
            [0xf2, 0xf6, 0xfa, 0xfe],
            [0xf3, 0xf7, 0xfb, 0x01],
          ],
          [
            [0xf0, 0xf4, 0xf8, 0xfc],
            [0xf1, 0xf5, 0xf9, 0xfd],
            [0xf2, 0xf6, 0xfa, 0xfe],
            [0xf3, 0xf7, 0xfb, 0x02],
          ],
        ],
      }
    );
  });
});
