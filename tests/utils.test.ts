import { WitnessTester } from "circomkit";
import { circomkit } from "./common";

describe("AES Key Expansion Components", () => {
  describe("BytesToWords", () => {
    let circuit: WitnessTester<["bytes"], ["words"]>;
    before(async () => {
      circuit = await circomkit.WitnessTester(`BytesToWords`, {
        file: "key_expansion",
        template: "BytesToWords",
        params: [4],
      });
      console.log("BytesToWords #constraints:", await circuit.getConstraintCount());
    });

    it("should compute correctly", async () => {
      await circuit.expectPass({ bytes: [0x01, 0x12, 0x02, 0x30] }, { words: [[0x01, 0x12, 0x02, 0x30]] });
    });
  });

  describe("RotateWord", () => {
    let circuit: WitnessTester<["bytes"], ["rotated"]>;
    before(async () => {
      circuit = await circomkit.WitnessTester(`RotateWord`, {
        file: "key_expansion",
        template: "RotateWord",
        params: [1],
      });
      console.log("RotateWord #constraints:", await circuit.getConstraintCount());
    });

    it("should rotate correctly", async () => {
      await circuit.expectPass({ bytes: [0x01, 0x12, 0x02, 0x30] }, { rotated: [0x12, 0x02, 0x30, 0x01] });
    });
  });

  describe("SubstituteWord", () => {
    let circuit: WitnessTester<["bytes"], ["substituted"]>;
    before(async () => {
      circuit = await circomkit.WitnessTester(`SubstituteWord`, {
        file: "key_expansion",
        template: "SubstituteWord",
      });
      console.log("SubstituteWord #constraints:", await circuit.getConstraintCount());
    });

    it("should substitute correctly", async () => {
      await circuit.expectPass({ bytes: [0x00, 0x10, 0x20, 0x30] }, { substituted: [0x63, 0xca, 0xb7, 0x04] });
    });
  });

  describe("RCon", () => {
    let circuit: WitnessTester<["round"], ["out"]>;
    before(async () => {
      circuit = await circomkit.WitnessTester(`RCon`, {
        file: "key_expansion",
        template: "RCon",
      });
      console.log("RCon #constraints:", await circuit.getConstraintCount());
    });

    it("should compute round constant correctly", async () => {
      await circuit.expectPass({ round: 1 }, { out: [0x01, 0x00, 0x00, 0x00] });
      await circuit.expectPass({ round: 2 }, { out: [0x02, 0x00, 0x00, 0x00] });
      await circuit.expectPass({ round: 10 }, { out: [0x36, 0x00, 0x00, 0x00] });
    });
  });

  describe("XorWord", () => {
    let circuit: WitnessTester<["bytes1", "bytes2"], ["out"]>;
    before(async () => {
      circuit = await circomkit.WitnessTester(`XorWord`, {
        file: "key_expansion",
        template: "XorWord",
      });
      console.log("XorWord #constraints:", await circuit.getConstraintCount());
    });

    it("should XOR correctly", async () => {
      await circuit.expectPass(
        { bytes1: [0x0a, 0x0b, 0x0c, 0x0d], bytes2: [0x01, 0x02, 0x03, 0x04] },
        { out: [0x0b, 0x09, 0x0f, 0x09] }
      );
    });
  });

  describe("WordSelector", () => {
    let circuit: WitnessTester<["condition", "bytes1", "bytes2"], ["out"]>;
    before(async () => {
      circuit = await circomkit.WitnessTester(`WordSelector`, {
        file: "key_expansion",
        template: "WordSelector",
      });
      console.log("WordSelector #constraints:", await circuit.getConstraintCount());
    });

    it("should select first word when condition is 1", async () => {
      await circuit.expectPass(
        { condition: 1, bytes1: [0x0a, 0x0b, 0x0c, 0x0d], bytes2: [0x01, 0x02, 0x03, 0x04] },
        { out: [0x0a, 0x0b, 0x0c, 0x0d] }
      );
    });

    it("should select second word when condition is 0", async () => {
      await circuit.expectPass(
        { condition: 0, bytes1: [0x0a, 0x0b, 0x0c, 0x0d], bytes2: [0x01, 0x02, 0x03, 0x04] },
        { out: [0x01, 0x02, 0x03, 0x04] }
      );
    });
  });
});

describe("XTimes2", () => {
  let circuit: WitnessTester<["in"], ["out"]>;
  it("should perform 2 times", async () => {
    circuit = await circomkit.WitnessTester(`XTimes2`, {
      file: "cipher",
      template: "XTimes2",
    });
    console.log("@XTimes2 #constraints:", await circuit.getConstraintCount());

    // 0x57 . 2 = 0xae
    await circuit.expectPass({ in: [1, 1, 1, 0, 1, 0, 1, 0] }, { out: [0, 1, 1, 1, 0, 1, 0, 1] });
    // 0x54 . 2 = 0xa8
    await circuit.expectPass({ in: [0, 0, 1, 0, 1, 0, 1, 0] }, { out: [0, 0, 0, 1, 0, 1, 0, 1] });
    // 0xae . 2 = 0x47
    await circuit.expectPass({ in: [0, 1, 1, 1, 0, 1, 0, 1] }, { out: [1, 1, 1, 0, 0, 0, 1, 0] });
    // 0x47 . 2 = 0x8e
    await circuit.expectPass({ in: [1, 1, 1, 0, 0, 0, 1, 0] }, { out: [0, 1, 1, 1, 0, 0, 0, 1] });
  });
});
describe("XTimes", () => {
  let circuit: WitnessTester<["in"], ["out"]>;
  it("should perform  xtimes", async () => {
    circuit = await circomkit.WitnessTester(`XTimes`, {
      file: "cipher",
      template: "XTimes",
      params: [0x13],
    });
    console.log("@XTimes2 #constraints:", await circuit.getConstraintCount());

    // 0x57 . 0x13 = 0xfe
    await circuit.expectPass({ in: [1, 1, 1, 0, 1, 0, 1, 0] }, { out: [0, 1, 1, 1, 1, 1, 1, 1] });
  });
});

describe("XTimes2 with XTimes", () => {
  let circuit: WitnessTester<["in"], ["out"]>;
  it("should perform 2 times with XTERMS", async () => {
    circuit = await circomkit.WitnessTester(`XTimes`, {
      file: "cipher",
      template: "XTimes",
      params: [0x2],
    });
    console.log("@XTimes2 #constraints:", await circuit.getConstraintCount());

    // 0x57 . 2 = 0xae
    await circuit.expectPass({ in: [1, 1, 1, 0, 1, 0, 1, 0] }, { out: [0, 1, 1, 1, 0, 1, 0, 1] });
    // 0x54 . 2 = 0xa8
    await circuit.expectPass({ in: [0, 0, 1, 0, 1, 0, 1, 0] }, { out: [0, 0, 0, 1, 0, 1, 0, 1] });
    // 0xae . 2 = 0x47
    await circuit.expectPass({ in: [0, 1, 1, 1, 0, 1, 0, 1] }, { out: [1, 1, 1, 0, 0, 0, 1, 0] });
    // 0x47 . 2 = 0x8e
    await circuit.expectPass({ in: [1, 1, 1, 0, 0, 0, 1, 0] }, { out: [0, 1, 1, 1, 0, 0, 0, 1] });
  });
});

describe("XTimes1 with XTimes", () => {
  let circuit: WitnessTester<["in"], ["out"]>;
  it("should perform 1 times with XTERMS", async () => {
    circuit = await circomkit.WitnessTester(`XTimes`, {
      file: "cipher",
      template: "XTimes",
      params: [0x1],
    });
    console.log("@XTimes2 #constraints:", await circuit.getConstraintCount());

    // 0x57 . 2 = 0xae
    await circuit.expectPass({ in: [1, 1, 1, 0, 1, 0, 1, 0] }, { out: [1, 1, 1, 0, 1, 0, 1, 0] });
    // 0x54 . 2 = 0xa8
    await circuit.expectPass({ in: [0, 0, 1, 0, 1, 0, 1, 0] }, { out: [0, 0, 1, 0, 1, 0, 1, 0] });
    // 0xae . 2 = 0x47
    await circuit.expectPass({ in: [0, 1, 1, 1, 0, 1, 0, 1] }, { out: [0, 1, 1, 1, 0, 1, 0, 1] });
    // 0x47 . 2 = 0x8e
    await circuit.expectPass({ in: [1, 1, 1, 0, 1, 0, 1, 0] }, { out: [1, 1, 1, 0, 1, 0, 1, 0] });
  });
});

describe("MixColumns", () => {
  it("s0 should compute correctly", async () => {
    let circuit: WitnessTester<["in"], ["out"]>;
    circuit = await circomkit.WitnessTester(`s0`, {
      file: "cipher",
      template: "S0",
      params: [],
    });
    console.log("@S0 #constraints:", await circuit.getConstraintCount());

    await circuit.expectPass({ in: [0xd4, 0xbf, 0x5d, 0x30] }, { out: 0x04 });
  });

  it("s1 should compute correctly", async () => {
    let circuit: WitnessTester<["in"], ["out"]>;
    circuit = await circomkit.WitnessTester(`s1`, {
      file: "cipher",
      template: "S1",
      params: [],
    });
    console.log("@S1 #constraints:", await circuit.getConstraintCount());

    await circuit.expectPass({ in: [0xd4, 0xbf, 0x5d, 0x30] }, { out: 0x66 });
  });

  it("s2 should compute correctly", async () => {
    let circuit: WitnessTester<["in"], ["out"]>;
    circuit = await circomkit.WitnessTester(`s2`, {
      file: "cipher",
      template: "S2",
      params: [],
    });
    console.log("@S2 #constraints:", await circuit.getConstraintCount());

    await circuit.expectPass({ in: [0xd4, 0xbf, 0x5d, 0x30] }, { out: 0x81 });
  });

  it("s3 should compute correctly", async () => {
    let circuit: WitnessTester<["in"], ["out"]>;
    circuit = await circomkit.WitnessTester(`s3`, {
      file: "cipher",
      template: "S3",
      params: [],
    });
    console.log("@S3 #constraints:", await circuit.getConstraintCount());

    await circuit.expectPass({ in: [0xd4, 0xbf, 0x5d, 0x30] }, { out: 0xe5 });
  });

  it.only("should compute correctly", async () => {
    let circuit: WitnessTester<["state"], ["out"]>;
    circuit = await circomkit.WitnessTester(`MixColumns`, {
      file: "cipher",
      template: "MixColumns",
      params: [],
    });
    console.log("@MixColumns #constraints:", await circuit.getConstraintCount());
    const state = [
      [0xd4, 0xe0, 0xb8, 0x1e],
      [0xbf, 0xb4, 0x41, 0x27],
      [0x5d, 0x52, 0x11, 0x98],
      [0x30, 0xae, 0xf1, 0xe5],
    ];

    const out = [
      [0x04, 0xe0, 0x48, 0x28],
      [0x66, 0xcb, 0xf8, 0x06],
      [0x81, 0x19, 0xd3, 0x26],
      [0xe5, 0x9a, 0x7a, 0x4c],
    ];

    await circuit.expectPass({ state }, { out });
  });
});

describe("AddRoundKey", () => {
  let circuit: WitnessTester<["state", "roundKey"], ["newState"]>;
  it("should perform AddRoundKey", async () => {
    circuit = await circomkit.WitnessTester(`AddRoundKey`, {
      file: "cipher",
      template: "AddRoundKey",
      params: [4],
    });
    console.log("@AddRoundKey #constraints:", await circuit.getConstraintCount());

    // 0x57 . 2 = 0xae
    await circuit.expectPass(
      {
        state: [
          [4, 224, 72, 40],
          [102, 203, 248, 6],
          [129, 25, 211, 38],
          [229, 154, 122, 76],
        ],
        roundKey: [[160, 136, 35, 42, 250, 84, 163, 108, 254, 44, 57, 118, 23, 177, 57, 5]],
      },
      {
        newState: [
          [164, 104, 107, 2],
          [156, 159, 91, 106],
          [127, 53, 234, 80],
          [242, 43, 67, 73],
        ],
      }
    );
  });
});

describe("SubBlock", () => {
  let circuit: WitnessTester<["state"], ["newState"]>;
  it("should perform SubBlock", async () => {
    circuit = await circomkit.WitnessTester(`SubBlock`, {
      file: "cipher",
      template: "SubBlock",
      params: [4],
    });
    console.log("@SubBlock #constraints:", await circuit.getConstraintCount());

    // 0x57 . 2 = 0xae
    await circuit.expectPass(
      {
        state: [
          [25, 160, 154, 233],
          [61, 244, 198, 248],
          [227, 226, 141, 72],
          [190, 43, 42, 8],
        ],
      },
      {
        newState: [
          [212, 224, 184, 30],
          [39, 191, 180, 65],
          [17, 152, 93, 82],
          [174, 241, 229, 48],
        ],
      }
    );
  });
});

describe("ShiftRows", () => {
  let circuit: WitnessTester<["state"], ["newState"]>;
  it("should perform ShiftRows", async () => {
    circuit = await circomkit.WitnessTester(`ShiftRows`, {
      file: "cipher",
      template: "ShiftRows",
      params: [4],
    });
    console.log("@ShiftRows #constraints:", await circuit.getConstraintCount());

    // 0x57 . 2 = 0xae
    await circuit.expectPass(
      {
        state: [
          [212, 224, 184, 30],
          [39, 191, 180, 65],
          [17, 152, 93, 82],
          [174, 241, 229, 48],
        ],
      },
      {
        newState: [
          [212, 224, 184, 30],
          [191, 180, 65, 39],
          [93, 82, 17, 152],
          [48, 174, 241, 229],
        ],
      }
    );
  });
});

describe("Cipher", () => {
  let circuit: WitnessTester<["state"], ["newState"]>;
  it("should perform Cipher", async () => {
    circuit = await circomkit.WitnessTester(`Cipher`, {
      file: "cipher",
      template: "Cipher",
      params: [4],
    });
    console.log("@ShiftRows #constraints:", await circuit.getConstraintCount());

    // 0x57 . 2 = 0xae
    await circuit.expectPass(
      {
        state: [
          [0x32, 0x88, 0x31, 0xe0],
          [0x43, 0x5a, 0x31, 0x37],
          [0xf6, 0x30, 0x98, 0x07],
          [0xa8, 0x8d, 0xa2, 0x34],
        ],
      },
      {
        newState: [
          [0x39, 0x02, 0xdc, 0x19],
          [0x25, 0xdc, 0x11, 0x6a],
          [0x84, 0x09, 0x85, 0x0b],
          [0x1d, 0xfb, 0x97, 0x32],
        ],
      }
    );
  });
});
