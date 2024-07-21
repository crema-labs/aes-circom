import { WitnessTester } from "circomkit";
import { circomkit } from "./common";

describe("SubBytes", () => {
  const N = 2;
  let circuit: WitnessTester<["key"], ["out"]>;

  describe("vanilla", () => {
    before(async () => {
      circuit = await circomkit.WitnessTester(`SubBytes_${N}`, {
        file: "subbytes",
        template: "SubBytes",
        params: [N],
      });
      console.log("#constraints:", await circuit.getConstraintCount());
    });

    it("should compute correctly", async () => {
      const witness = await circuit.calculateWitness({ key: [1, 1] });
      await circuit.expectPass({ key: [1, 1] }, { out: 1 });
    });
  });
});
