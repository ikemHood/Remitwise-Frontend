import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { storeNonce } from '@/lib/auth/nonce-store';
import { getTranslator } from '@/lib/i18n';
import { NextRequest, NextResponse } from "next/server";
import { storeNonce } from "@/lib/auth/nonce-store";
import { randomBytes } from "crypto";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/auth/nonce
 * Generate a nonce for signature-based authentication
 * 
 * Query Parameters:
 * - address: Stellar address requesting the nonce
 */
export async function GET(request: NextRequest) {
    try {
        const address = request.nextUrl.searchParams.get('address');
        const t = getTranslator(request.headers.get('accept-language'));

        if (!address) {
            return NextResponse.json(
                { error: t('errors.address_required') },
                { status: 400 }
            );
        }

        // Validate Stellar address format (G + 55 alphanumeric characters)
        if (!/^G[A-Z0-9]{55}$/.test(address)) {
            return NextResponse.json(
                { error: t('errors.invalid_address_format') || 'Invalid Stellar address format' },
                { status: 400 }
            );
        }

        // Generate a random nonce
        const nonce = randomBytes(32).toString('hex');

        // Store nonce with 5 minute expiration
        storeNonce(address, nonce);
  // Store nonce in cache for later verification
  storeNonce(publicKey, nonce);

        return NextResponse.json({
            nonce,
            address,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
        });
    } catch (error) {
        console.error('Error generating nonce:', error);
        const t = getTranslator(request.headers.get('accept-language'));
        return NextResponse.json(
            { error: t('errors.internal_server_error') },
            { status: 500 }
        );
    }
}

/**
 * POST /api/auth/nonce
 * Alternative method to generate a nonce (for backward compatibility)
 * 
 * Body:
 * - publicKey: Stellar address requesting the nonce
 */
export async function POST(request: NextRequest) {
    try {
        const { publicKey } = await request.json();
        const t = getTranslator(request.headers.get('accept-language'));

        if (!publicKey) {
            return NextResponse.json(
                { error: t('errors.address_required') },
                { status: 400 }
            );
        }

        // Validate Stellar address format
        if (!/^G[A-Z0-9]{55}$/.test(publicKey)) {
            return NextResponse.json(
                { error: t('errors.invalid_address_format') },
                { status: 400 }
            );
        }

        // Generate a random nonce
        const nonce = randomBytes(32).toString('hex');

        // Store nonce with 5 minute expiration
        storeNonce(publicKey, nonce);

        return NextResponse.json({ 
            nonce,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        });
    } catch (error) {
        console.error('Error generating nonce:', error);
        const t = getTranslator(request.headers.get('accept-language'));
        return NextResponse.json(
            { error: t('errors.internal_server_error') },
            { status: 500 }
        );
    }
}