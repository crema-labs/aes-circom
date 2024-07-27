import { Circomkit } from "circomkit";

export const circomkit = new Circomkit({
  verbose: false,
});

export const Num2Bits = (n: number) => {
  let bits = [];
  for (let i = 0; i < 8; i++) {
    bits.push((n >> i) & 1);
  }
  return bits;
};
