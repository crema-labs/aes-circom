import crypto from "crypto";

/** A 4×4 matrix of bytes: [4][4]. */
export type Block4x4 = number[][];

/**
 * Flatten a 4×4 matrix of bytes into a 16-byte Uint8Array
 */
function flattenBlock(block: Block4x4): Uint8Array {
  const out = new Uint8Array(16);
  let idx = 0;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      out[idx++] = block[col][row] & 0xff;
    }
  }
  return out;
}

/**
 * Un-flatten a 16-byte Uint8Array into a 4×4 matrix of bytes
 */
function unflattenBlock(bytes: Uint8Array): Block4x4 {
  const out: Block4x4 = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  let idx = 0;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      out[col][row] = bytes[idx++];
    }
  }
  return out;
}

/**
 * Encrypt exactly one 16-byte block in AES-ECB mode, no padding.
 * Supports 128-, 192-, or 256-bit keys (16, 24, or 32 bytes).
 *
 * @param key Array of 16, 24, or 32 bytes (numbers)
 * @param block 4×4 matrix of plaintext bytes
 * @returns 4×4 matrix of ciphertext bytes
 */
export function encryptAesEcbNoPadding(key: number[], block: Block4x4): Block4x4 {
  if (![16, 24, 32].includes(key.length)) {
    throw new Error("Key must be 16, 24, or 32 bytes for AES.");
  }

  // Flatten the 4×4 block to 16 bytes
  const blockBytes = flattenBlock(block);

  // Convert key to a Buffer
  const keyBuf = Buffer.from(key);

  // Select the correct AES-ECB algorithm name
  const algorithm = {
    16: "aes-128-ecb",
    24: "aes-192-ecb",
    32: "aes-256-ecb",
  }[keyBuf.length] as crypto.CipherGCMTypes;

  // Create Cipher in ECB mode, disable padding
  const cipher = crypto.createCipheriv(algorithm, keyBuf, null);
  cipher.setAutoPadding(false);

  // Encrypt
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(blockBytes)),
    cipher.final(),
  ]);

  if (encrypted.length !== 16) {
    throw new Error(`Expected 16 bytes of ciphertext, got ${encrypted.length}.`);
  }

  // Un-flatten back into a 4×4 matrix
  return unflattenBlock(encrypted);
}

/**
 * Decrypt exactly one 16-byte block in AES-ECB mode, no padding.
 *
 * @param key Array of 16, 24, or 32 bytes (numbers)
 * @param block 4×4 matrix of ciphertext bytes
 * @returns 4×4 matrix of plaintext bytes
 */
export function decryptAesEcbNoPadding(key: number[], block: Block4x4): Block4x4 {
  if (![16, 24, 32].includes(key.length)) {
    throw new Error("Key must be 16, 24, or 32 bytes for AES.");
  }

  // Flatten the 4×4 block to 16 bytes
  const blockBytes = flattenBlock(block);

  // Convert key to a Buffer
  const keyBuf = Buffer.from(key);

  // Select the correct AES-ECB algorithm name
  const algorithm = {
    16: "aes-128-ecb",
    24: "aes-192-ecb",
    32: "aes-256-ecb",
  }[keyBuf.length] as crypto.CipherGCMTypes;

  // Create Decipher in ECB mode, disable padding
  const decipher = crypto.createDecipheriv(algorithm, keyBuf, null);
  decipher.setAutoPadding(false);

  // Decrypt
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(blockBytes)),
    decipher.final(),
  ]);

  if (decrypted.length !== 16) {
    throw new Error(`Expected 16 bytes of plaintext, got ${decrypted.length}.`);
  }

  // Un-flatten back into a 4×4 matrix
  return unflattenBlock(decrypted);
}

