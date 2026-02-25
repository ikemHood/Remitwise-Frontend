import { NextRequest, NextResponse } from 'next/server';
import { withIdempotency } from '@/lib/idempotency';

/**
 * POST /api/remittance/build
 * Build a remittance transaction
 * 
 * Supports idempotency via Idempotency-Key header
 */
export async function POST(request: NextRequest) {
    return withIdempotency(request, async (body) => {
        // TODO: Add authentication
        // const session = await getSession(request);
        // if (!session) {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        // Validate request body
        const { amount, recipient, currency } = body;

        if (!amount || !recipient || !currency) {
            return NextResponse.json(
                { error: 'Missing required fields: amount, recipient, currency' },
                { status: 400 }
            );
        }

        if (amount <= 0) {
            return NextResponse.json(
                { error: 'Amount must be greater than 0' },
                { status: 400 }
            );
        }

        // TODO: Implement actual remittance building logic
        // For now, return a mock response
        const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        return NextResponse.json({
            transactionId,
            amount,
            recipient,
            currency,
            status: 'pending',
            createdAt: new Date().toISOString(),
            message: 'Remittance transaction built successfully',
        });
    });
}
