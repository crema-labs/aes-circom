# aes-circom

This repository contains generic implementation for AES encryption in Circom.

## AES

AES is a symmetric encryption algorithm that was established by the U.S. National Institute of Standards and Technology (NIST) in 2001. It is a subset of the Rijndael block cipher. AES has a fixed block size of 128 bits and a key size of 128, 192, or 256 bits. The algorithm is based on a design principle known as a substitution-permutation network (SPN).
Read more about AES here := [FIPS 197](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf).
Simple Rust implementation of AES can be found here := [tinyaes](https://docs.rs/crate/tinyaes/latest/source/src/aes_core.rs)

## Circuit

The circuits contain components for AES forward encryption. The implementation strictly follows the AES standard mentioned in the FIPS 197 document. The circuit is designed to be generic and can be used for any key size (128, 192, 256 bits) and block size (128 bits).

Check the [Cipher](https://github.com/crema-labs/aes/blob/main/circuits/cipher.circom) and [KeyExpansion](https://github.com/crema-labs/aes/blob/main/circuits/key_expansion.circom) circuits for visual representation of the design.

### Constraints

The following constraint values were calculated using 
```sh
circom -l node_modules ./circuits/main/cipher_4.circom -o build --r1cs --wasm                    
```

<img width="282" alt="contraints" src="https://github.com/user-attachments/assets/f9f13742-321a-4a1e-9676-f125e2aaf2ee">

## Design Decisions

The circuit only support the forward encryption of AES as we believe that the proof of computation for any proprietary use case can be refactored to use the forward encryption instead of the decryption. 

 💡 Create an issue if you think that the decryption circuit is necessary.

## Circomkit

In this repository, we are using [Circomkit](https://github.com/erhant/circomkit) to test some example circuits using Mocha. The circuits and the statements that they prove are as follows:

### Configuration

Circomkit checks for `circomkit.json` to override it's default configurations. We could for example change the target version, prime field and the proof system by setting `circomkit.json` to be:

```json
{
  "version": "2.1.8",
  "protocol": "plonk",
  "prime": "bls12381"
}
```

### Testing

You can use the following commands to test the circuits:

```sh
# test everything
yarn test

# test a specific circuit
yarn test -g <template-name>
```

## Roadmap

- [x] AES Forward Encryption Circuit
- [ ] Add AES-CTR mode (priority for ECIES implementaion)
- [ ] Add all other modes adhering to [NIST standards](https://nvlpubs.nist.gov/nistpubs/legacy/sp/nistspecialpublication800-38a.pdf)

## Contribution

Feel free to contribute to this repository by creating issues or pull requests. We are open to any suggestions or improvements.
