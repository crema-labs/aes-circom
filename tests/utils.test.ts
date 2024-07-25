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
