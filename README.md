# Circomkit Examples

In this repository, we are using [Circomkit](https://github.com/erhant/circomkit) to test some example circuits using Mocha. The circuits and the statements that they prove are as follows:

- **Multiplier**: "I know `n` factors that make up some number".
- **Fibonacci**: "I know the `n`'th Fibonacci number".
- **SHA256**: "I know the `n`-byte preimage of some SHA256 digest".
- **Sudoku**: "I know the solution to some `(n^2)x(n^2)` Sudoku puzzle".
- **Floating-Point Addition**: "I know two floating-point numbers that make up some number with `e` exponent and `m` mantissa bits." (adapted from [Berkeley ZKP MOOC 2023 - Lab](https://github.com/rdi-berkeley/zkp-mooc-lab)).

## CLI Usage

To use Circomkit CLI with a circuit, let's say for Sudoku 9x9, we follow the steps below:

1. We write a circuit config in `circuits.json` with the desired parameters. In this case, we are working with the 9x9 Sudoku solution circuit, and the board size is calculated by the square of our template parameter so we should give 3. Furthermore, `puzzle` is a public input so we should specify that too.

```json
{
  "sudoku_9x9": {
    "file": "sudoku",
    "template": "Sudoku",
    "pubs": ["puzzle"],
    "params": [3]
  }
}
```

2. Compile the circuit with Circomkit, providing the same circuit name as in `circuits.json`:

```sh
npx circomkit compile sudoku_9x9

# print circuit info if you want to
npx circomkit info sudoku_9x9
```

3. Commence circuit-specific setup. Normally, this requires us to download a Phase-1 PTAU file and provide it's path; however, Circomkit can determine the required PTAU and download it automatically when using `bn128` curve, thanks to [Perpetual Powers of Tau](https://github.com/privacy-scaling-explorations/perpetualpowersoftau). In this case, `sudoku_9x9` circuit has 4617 constraints, so Circomkit will download `powersOfTau28_hez_final_13.ptau` (see [here](https://github.com/iden3/snarkjs#7-prepare-phase-2)).

```sh
npx circomkit setup sudoku_9x9

# alternative: provide the PTAU yourself
npx circomkit setup sudoku_9x9 <path-to-ptau>
```

4. Prepare your input file under `./inputs/sudoku_9x9/default.json`.

```json
{
  "solution": [
    [1, 9, 4, 8, 6, 5, 2, 3, 7],
    [7, 3, 5, 4, 1, 2, 9, 6, 8],
    [8, 6, 2, 3, 9, 7, 1, 4, 5],
    [9, 2, 1, 7, 4, 8, 3, 5, 6],
    [6, 7, 8, 5, 3, 1, 4, 2, 9],
    [4, 5, 3, 9, 2, 6, 8, 7, 1],
    [3, 8, 9, 6, 5, 4, 7, 1, 2],
    [2, 4, 6, 1, 7, 9, 5, 8, 3],
    [5, 1, 7, 2, 8, 3, 6, 9, 4]
  ],
  "puzzle": [
    [0, 0, 0, 8, 6, 0, 2, 3, 0],
    [7, 0, 5, 0, 0, 0, 9, 0, 8],
    [0, 6, 0, 3, 0, 7, 0, 4, 0],
    [0, 2, 0, 7, 0, 8, 0, 5, 0],
    [0, 7, 8, 5, 0, 0, 0, 0, 0],
    [4, 0, 0, 9, 0, 6, 0, 7, 0],
    [3, 0, 9, 0, 5, 0, 7, 0, 2],
    [0, 4, 0, 1, 0, 9, 0, 8, 0],
    [5, 0, 7, 0, 8, 0, 0, 9, 4]
  ]
}
```

5. We are ready to create a proof!

```sh
npx circomkit prove sudoku_9x9 default
```

6. We can then verify our proof. You can try and modify the public input at `./build/sudoku_9x9/default/public.json` and see if the proof verifies or not!

```sh
npx circomkit verify sudoku_9x9 default
```

## In-Code Usage

If you would like to use Circomkit within the code itself, rather than the CLI, you can see the example at `src/index.ts`. You can `yarn start` to see it in action.

```ts
// create circomkit
const circomkit = new Circomkit({
  protocol: "groth16",
});

// artifacts output at `build/multiplier_3` directory
await circomkit.compile("multiplier_3", {
  file: "multiplier",
  template: "Multiplier",
  params: [3],
});

// proof & public signals at `build/multiplier_3/my_input` directory
await circomkit.prove("multiplier_3", "my_input", { in: [3, 5, 7] });

// verify with proof & public signals at `build/multiplier_3/my_input`
const ok = await circomkit.verify("multiplier_3", "my_input");
if (ok) {
  circomkit.log("Proof verified!", "success");
} else {
  circomkit.log("Verification failed.", "error");
}
```

## Configuration

Circomkit checks for `circomkit.json` to override it's default configurations. We could for example change the target version, prime field and the proof system by setting `circomkit.json` to be:

```json
{
  "version": "2.1.2",
  "protocol": "plonk",
  "prime": "bls12381"
}
```

## Testing

You can use the following commands to test the circuits:

```sh
# test everything
yarn test

# test a specific circuit
yarn test -g <circuit-name>
```
