import { WitnessTester } from "circomkit";
import { circomkit } from "./common";

describe("SubBytes", () => {
  const f = (str: string) => Array.from(Buffer.from(str, "utf-8"));
  const length = 128;
  let circuit: WitnessTester<["key"], []>;

  describe("matcher test-1", () => {
    before(async () => {
      circuit = await circomkit.WitnessTester(`SubBytes_${length}`, {
        file: "subbytes",
        template: "SubBytes",
        params: [16],
      });
      console.log("#constraints:", await circuit.getConstraintCount());
    });

    it(async () => {
      //   circuit.compute({ key: f("abcd") }, []);
      await circuit.expectPass({ key: f("abcd") });
    });
  });
});
