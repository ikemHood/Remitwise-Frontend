import { NextResponse } from 'next/server'
import { buildCreatePolicyTx } from '../../../../lib/contracts/insurance'
import { StrKey } from '@stellar/stellar-sdk'
import { ApiRouteError, withApiErrorHandler } from '@/lib/api/error-handler'

export const POST = withApiErrorHandler(async function POST(req: Request) {
  const caller = req.headers.get('x-user')
  if (!caller || !StrKey.isValidEd25519PublicKey(caller)) {
    throw new ApiRouteError(401, 'UNAUTHORIZED', 'Unauthorized')
  }

  const body = await req.json()
  const { name, coverageType, monthlyPremium, coverageAmount } = body || {}

  if (!name || typeof name !== 'string') {
    throw new ApiRouteError(400, 'VALIDATION_ERROR', 'Invalid name')
  }
  if (!coverageType || typeof coverageType !== 'string') {
    throw new ApiRouteError(400, 'VALIDATION_ERROR', 'Invalid coverageType')
  }

  const mp = Number(monthlyPremium)
  const ca = Number(coverageAmount)
  if (!(mp > 0)) {
    throw new ApiRouteError(400, 'VALIDATION_ERROR', 'Invalid monthlyPremium; must be > 0')
  }
  if (!(ca > 0)) {
    throw new ApiRouteError(400, 'VALIDATION_ERROR', 'Invalid coverageAmount; must be > 0')
  }

  const xdr = await buildCreatePolicyTx(caller, name, coverageType, mp, ca)
  return NextResponse.json({ xdr })
})
