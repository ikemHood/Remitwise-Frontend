import { NextResponse } from 'next/server'
import { buildCreateBillTx } from '../../../../lib/contracts/bill-payments'
import { StrKey } from '@stellar/stellar-sdk'
import { ApiRouteError, withApiErrorHandler } from '@/lib/api/error-handler'

export const POST = withApiErrorHandler(async function POST(req: Request) {
  const caller = req.headers.get('x-user')
  if (!caller || !StrKey.isValidEd25519PublicKey(caller)) {
    throw new ApiRouteError(401, 'UNAUTHORIZED', 'Unauthorized')
  }

  const body = await req.json()
  const { name, amount, dueDate, recurring = false, frequencyDays } = body || {}

  if (!name || typeof name !== 'string') {
    throw new ApiRouteError(400, 'VALIDATION_ERROR', 'Invalid name')
  }
  const numAmount = Number(amount)
  if (!(numAmount > 0)) {
    throw new ApiRouteError(400, 'VALIDATION_ERROR', 'Invalid amount; must be > 0')
  }
  if (recurring && !(frequencyDays && Number(frequencyDays) > 0)) {
    throw new ApiRouteError(400, 'VALIDATION_ERROR', 'Invalid frequencyDays for recurring bill')
  }
  if (!dueDate || Number.isNaN(Date.parse(dueDate))) {
    throw new ApiRouteError(400, 'VALIDATION_ERROR', 'Invalid dueDate')
  }

  const xdr = await buildCreateBillTx(caller, name, numAmount, dueDate, Boolean(recurring), frequencyDays ? Number(frequencyDays) : undefined)
  return NextResponse.json({ xdr })
})
