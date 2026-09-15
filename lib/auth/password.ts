import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
const scrypt = (password: string, salt: string, keyLength: number, options: { N: number; r: number; p: number; maxmem: number }) =>
  new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey as Buffer);
    });
  });
const KEY_LENGTH = 64;
const COST = 16384;
const BLOCK_SIZE = 8;
const PARALLELIZATION = 1;

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('base64url');
  const derivedKey = await scrypt(password, salt, KEY_LENGTH, {
    N: COST,
    r: BLOCK_SIZE,
    p: PARALLELIZATION,
    maxmem: 32 * 1024 * 1024,
  });
  return `scrypt$${COST}$${BLOCK_SIZE}$${PARALLELIZATION}$${salt}$${derivedKey.toString('base64url')}`;
}

export async function verifyPassword(password: string, encodedHash: string) {
  const [algorithm, costText, blockSizeText, parallelizationText, salt, encodedKey] = encodedHash.split('$');
  if (algorithm !== 'scrypt' || !costText || !blockSizeText || !parallelizationText || !salt || !encodedKey) return false;

  const cost = Number(costText);
  const blockSize = Number(blockSizeText);
  const parallelization = Number(parallelizationText);
  if (!Number.isSafeInteger(cost) || !Number.isSafeInteger(blockSize) || !Number.isSafeInteger(parallelization)) return false;

  const derivedKey = await scrypt(password, salt, KEY_LENGTH, {
    N: cost,
    r: blockSize,
    p: parallelization,
    maxmem: 32 * 1024 * 1024,
  });
  const storedKey = Buffer.from(encodedKey, 'base64url');
  return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
}
