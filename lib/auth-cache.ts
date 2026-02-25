export const nonceCache = new Map<string, { nonce: string; expiresAt: number }>();

export const NONCE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export function setNonce(address: string, nonce: string) {
    nonceCache.set(address, {
        nonce,
        expiresAt: Date.now() + NONCE_TTL_MS,
    });
}

export function getAndClearNonce(address: string): string | null {
    const data = nonceCache.get(address);
    if (!data) return null;

    // Always delete the nonce after retrieving it to prevent replay attacks
    nonceCache.delete(address);

    if (Date.now() > data.expiresAt) {
        return null; // Expired
    }

    return data.nonce;
}
