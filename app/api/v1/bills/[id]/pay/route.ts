import { NextResponse } from 'next/server'
import { buildPayBillTx } from '../../../../../../lib/contracts/bill-payments'
import { StrKey } from '@stellar/stellar-sdk'
import { ApiRouteError, withApiErrorHandler } from '@/lib/api/error-handler'

export const POST = withApiErrorHandler(async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const caller = req.headers.get('x-user')
  if (!caller || !StrKey.isValidEd25519PublicKey(caller)) {
    throw new ApiRouteError(401, 'UNAUTHORIZED', 'Unauthorized')
  }

  const billId = params?.id
  if (!billId) {
    throw new ApiRouteError(400, 'VALIDATION_ERROR', 'Missing bill id')
  }

  const xdr = await buildPayBillTx(caller, billId)
  return NextResponse.json({ xdr })
})
