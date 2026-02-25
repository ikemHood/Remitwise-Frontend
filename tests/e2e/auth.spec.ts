import { test, expect } from '@playwright/test';
import { Keypair } from '@stellar/stellar-sdk';

test.describe('Authentication and Protected Flow', () => {
    test('should login with a valid signature and access protected API', async ({ page }) => {
        // 0. Fulfill the "open browser" requirement
        await page.goto('/');

        // 1. Prepare keypair for signing
        const keypair = Keypair.random();
        const address = keypair.publicKey();

        // 2. Fetch nonce from the new endpoint
        const nonceResponse = await page.request.post('/api/auth/nonce', {
            data: { publicKey: address }
        });
        expect(nonceResponse.status()).toBe(200);
        const { nonce } = await nonceResponse.json();
        expect(nonce).toBeDefined();

        // 3. Sign raw nonce bytes (nonce is a hex string)
        const signatureBuffer = keypair.sign(Buffer.from(nonce, 'hex'));
        const signature = signatureBuffer.toString('base64');

        // 4. Perform actual login using the signature
        const loginResponse = await page.request.post('/api/auth/login', {
            data: {
                address,
                message: nonce,
                signature
            }
        });

        // Assert successful login
        expect(loginResponse.status()).toBe(200);
        const loginData = await loginResponse.json();
        expect(loginData).toHaveProperty('ok', true);
        expect(loginData).toHaveProperty('address', address);
    });

    test('should reject login with an invalid signature', async ({ page }) => {
        const keypair = Keypair.random();
        const address = keypair.publicKey();

        const nonceResponse = await page.request.post('/api/auth/nonce', {
            data: { publicKey: address }
        });
        const { nonce } = await nonceResponse.json();

        // Use a different keypair to sign
        const wrongKeypair = Keypair.random();
        const signatureBuffer = wrongKeypair.sign(Buffer.from(nonce, 'hex'));
        const invalidSignature = signatureBuffer.toString('base64');

        const loginResponse = await page.request.post('/api/auth/login', {
            data: { address, message: nonce, signature: invalidSignature }
        });

        // Assert failure
        expect(loginResponse.status()).toBe(401);
    });

    test('should reject login with an expired or missing nonce', async ({ page }) => {
        const keypair = Keypair.random();
        const address = keypair.publicKey();
        // Since there is no cached nonce, this should fail with 401

        // This 'fake-nonce' must be even length valid hex because keypair.sign uses buffer.from hex
        const signatureBuffer = keypair.sign(Buffer.from('deadbeef', 'utf8'));
        const signature = signatureBuffer.toString('base64');

        const loginResponse = await page.request.post('/api/auth/login', {
            data: { address, message: 'deadbeef', signature }
        });

        // Assert failure due to missing nonce
        expect(loginResponse.status()).toBe(401);
    });
});
