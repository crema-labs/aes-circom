import { WitnessTester } from "circomkit";
import { circomkit } from "./common";

describe("SubBytes", () => {
  let circuit: WitnessTester<["in"], ["out"]>;

  describe("vanilla", () => {
    before(async () => {
      circuit = await circomkit.WitnessTester(`SubBytes`, {
        file: "sbox128",
        template: "Sbox128",
        params: [],
      });
      console.log("#constraints:", await circuit.getConstraintCount());
    });

    it("should compute correctly", async () => {
      await circuit.expectPass({ in: 0x53 }, { out: 0xed });
    });
  });
});
