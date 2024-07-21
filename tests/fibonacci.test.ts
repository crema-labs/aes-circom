import { WitnessTester } from "circomkit";
import { circomkit } from "./common";

describe("fibonacci", () => {
  const N = 7;
  let circuit: WitnessTester<["in"], ["out"]>;

  describe("vanilla", () => {
    before(async () => {
      circuit = await circomkit.WitnessTester(`fibonacci_${N}`, {
        file: "fibonacci",
        template: "Fibonacci",
        params: [N],
      });
      console.log("#constraints:", await circuit.getConstraintCount());
    });

    it("should compute correctly", async () => {
      await circuit.expectPass({ in: [1, 1] }, { out: fibonacci([1, 1], N) });
    });
  });

  describe("recursive", () => {
    before(async () => {
      circuit = await circomkit.WitnessTester(`fibonacci_${N}_recursive`, {
        file: "fibonacci",
        template: "FibonacciRecursive",
        params: [N],
      });
      console.log("#constraints:", await circuit.getConstraintCount());
    });

    it("should compute correctly", async () => {
      await circuit.expectPass({ in: [1, 1] }, { out: fibonacci([1, 1], N) });
    });
  });
});

// simple fibonacci with 2 variables
function fibonacci(init: [number, number], n: number): number {
  if (n < 0) {
    throw new Error("N must be positive");
  }

  let [a, b] = init;
  for (let i = 2; i <= n; i++) {
    b = a + b;
    a = b - a;
  }
  return n === 0 ? a : b;
}
