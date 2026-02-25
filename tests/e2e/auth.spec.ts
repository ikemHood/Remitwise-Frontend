import { test, expect } from '@playwright/test';

test.describe('Authentication and Protected Flow', () => {
    test('should login with test wallet and access protected API', async ({ page }) => {
        // 0. Fulfill the "open browser" requirement
        await page.goto('/');

        // 1. Prepare env data for mock backend
        const testWalletAddress = process.env.TEST_WALLET_ADDRESS || 'GDEMOXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
        const testSignature = process.env.TEST_SIGNATURE || 'mock-signature';

        // 2. Perform mock login via the browser context
        const loginResponse = await page.request.post('/api/auth/login', {
            data: {
                address: testWalletAddress,
                signature: testSignature
            }
        });

        // Assert successful login
        expect(loginResponse.status()).toBe(200);
        const loginData = await loginResponse.json();
        expect(loginData).toHaveProperty('success', true);
        expect(loginData).toHaveProperty('token');

        // 3. Access the protected flow with the session cookie automatically attached to the page's request context
        const splitResponse = await page.request.get('/api/split');

        // Assert successful access to protected route
        expect(splitResponse.status()).toBe(200);
        const splitData = await splitResponse.json();
        expect(splitData).toHaveProperty('allocations');
        expect(splitData.allocations).toMatchObject({
            dailySpending: expect.any(Number),
            savings: expect.any(Number),
            bills: expect.any(Number),
            insurance: expect.any(Number),
        });
    });
});
