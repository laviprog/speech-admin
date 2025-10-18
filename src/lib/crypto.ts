import { randomBytes, createHash } from 'crypto';

export function generateApiKey(prefix = 'syn-stt') {
  const key_value = randomBytes(32).toString('base64url');

  const fullKey = `${prefix}-${key_value}`;

  const hashHex = createHash('sha256').update(fullKey).digest('hex');

  return {
    plaintext: fullKey,
    prefix,
    keyHash: hashHex,
  };
}
