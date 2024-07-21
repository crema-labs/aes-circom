import { WitnessTester } from "circomkit";
import { circomkit } from "./common";

const fixtures = [
  {
    ideal: "abc.",
    actual: "abcd",
    expect: 1, //true
  },
  {
    ideal: "abcd",
    actual: "abcd",
    expect: 1, //true
  },
  {
    ideal: "a..d",
    actual: "abcd",
    expect: 1, //true
  },
  {
    ideal: "....",
    actual: "abcd",
    expect: 1, //true
  },
  {
    ideal: "abce",
    actual: "abcd",
    expect: 0, //false
  },
  {
    ideal: "...e",
    actual: "abcd",
    expect: 0, //false
  },
];

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
      circuit.compute({ key: f("abcd") }, []);
    });
  });
});
