import {
  Networks,
  Account,
  TransactionBuilder,
  Operation,
  BASE_FEE,
  StrKey,
  Horizon,
} from '@stellar/stellar-sdk'

import {
  createValidationError,
  parseContractError,
  ContractErrorCode,
} from '@/lib/errors/contract-errors'

const HORIZON_URL =
  process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'

const NETWORK_PASSPHRASE =
  process.env.NETWORK_PASSPHRASE || Networks.TESTNET

const server = new Horizon.Server(HORIZON_URL)

// ── Bill type ────────────────────────────────────────────────────────────────

export interface Bill {
  id: string
  name: string
  amount: number
  dueDate: string
  recurring: boolean
  frequencyDays?: number
  paid: boolean
  status: 'paid' | 'overdue' | 'urgent' | 'upcoming'
  owner: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function validatePublicKey(pk: string) {
  try {
    return StrKey.isValidEd25519PublicKey(pk)
  } catch {
    return false
  }
}

async function loadAccount(accountId: string) {
  if (!validatePublicKey(accountId)) {
    throw createValidationError(
      ContractErrorCode.INVALID_ADDRESS,
      'Invalid Stellar account address',
      { contractId: 'bill-payments', metadata: { accountId } }
    )
  }

  try {
    return await server.loadAccount(accountId)
  } catch (error) {
    throw parseContractError(error, {
      contractId: 'bill-payments',
      method: 'loadAccount',
    })
  }
}

/**
 * Derives bill status from dueDate + paid flag.
 */
function deriveStatus(dueDate: string, paid: boolean): Bill['status'] {
  if (paid) return 'paid'

  const due = new Date(dueDate).getTime()
  const now = Date.now()
  const diffDays = (due - now) / (1000 * 60 * 60 * 24)

  if (diffDays < 0) return 'overdue'
  if (diffDays <= 3) return 'urgent'
  return 'upcoming'
}

/**
 * NOTE:
 * The Soroban contract is not yet deployed.
 * These reads are currently mocked.
 */

const MOCK_BILLS: Bill[] = [
  {
    id: '1',
    name: 'School Tuition',
    amount: 500,
    dueDate: '2026-01-25T00:00:00.000Z',
    recurring: false,
    paid: false,
    status: 'overdue',
    owner: 'mock',
  },
  {
    id: '2',
    name: 'Rent Payment',
    amount: 800,
    dueDate: '2026-02-01T00:00:00.000Z',
    recurring: true,
    frequencyDays: 30,
    paid: false,
    status: 'urgent',
    owner: 'mock',
  },
  {
    id: '3',
    name: 'Electricity Bill',
    amount: 150,
    dueDate: '2026-02-05T00:00:00.000Z',
    recurring: true,
    frequencyDays: 30,
    paid: false,
    status: 'upcoming',
    owner: 'mock',
  },
  {
    id: '4',
    name: 'Internet Service',
    amount: 60,
    dueDate: '2026-02-10T00:00:00.000Z',
    recurring: true,
    frequencyDays: 30,
    paid: true,
    status: 'paid',
    owner: 'mock',
  },
]

// ── Read Layer ────────────────────────────────────────────────────────────────

export async function getBill(id: string, owner: string): Promise<Bill> {
  const bill = MOCK_BILLS.find((b) => b.id === id)
  if (!bill) throw new Error('not-found')

  return {
    ...bill,
    status: deriveStatus(bill.dueDate, bill.paid),
    owner,
  }
}

export async function getUnpaidBills(owner: string): Promise<Bill[]> {
  return MOCK_BILLS.filter((b) => !b.paid).map((b) => ({
    ...b,
    status: deriveStatus(b.dueDate, b.paid),
    owner,
  }))
}

export async function getAllBills(owner: string): Promise<Bill[]> {
  return MOCK_BILLS.map((b) => ({
    ...b,
    status: deriveStatus(b.dueDate, b.paid),
    owner,
  }))
}

export async function getTotalUnpaid(owner: string): Promise<number> {
  const unpaid = await getUnpaidBills(owner)
  return unpaid.reduce((sum, b) => sum + b.amount, 0)
}

export async function getOverdueBills(owner: string): Promise<Bill[]> {
  const all = await getAllBills(owner)
  return all.filter((b) => b.status === 'overdue')
}

// ── Transaction Builders ──────────────────────────────────────────────────────

export async function buildCreateBillTx(
  owner: string,
  name: string,
  amount: number,
  dueDate: string,
  recurring: boolean,
  frequencyDays?: number
) {
  if (!validatePublicKey(owner)) {
    throw createValidationError(
      ContractErrorCode.INVALID_ADDRESS,
      'Invalid owner address',
      { contractId: 'bill-payments', method: 'buildCreateBillTx', metadata: { owner } }
    )
  }

  if (!(amount > 0)) {
    throw createValidationError(
      ContractErrorCode.INVALID_AMOUNT,
      'Amount must be greater than zero',
      { contractId: 'bill-payments', method: 'buildCreateBillTx', metadata: { amount } }
    )
  }

  if (recurring && !(frequencyDays && frequencyDays > 0)) {
    throw createValidationError(
      ContractErrorCode.INVALID_FREQUENCY,
      'Frequency days must be greater than zero for recurring bills',
      { contractId: 'bill-payments', method: 'buildCreateBillTx', metadata: { frequencyDays } }
    )
  }

  if (Number.isNaN(Date.parse(dueDate))) {
    throw createValidationError(
      ContractErrorCode.INVALID_DUE_DATE,
      'Invalid due date format',
      { contractId: 'bill-payments', method: 'buildCreateBillTx', metadata: { dueDate } }
    )
  }

  try {
    const acctResp = await loadAccount(owner)
    const source = new Account(owner, acctResp.sequence)

    const txBuilder = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })

    txBuilder.addOperation(
      Operation.manageData({ name: 'bill:name', value: name.slice(0, 64) })
    )

    txBuilder.addOperation(
      Operation.manageData({ name: 'bill:amount', value: String(amount) })
    )

    txBuilder.addOperation(
      Operation.manageData({
        name: 'bill:dueDate',
        value: new Date(dueDate).toISOString(),
      })
    )

    txBuilder.addOperation(
      Operation.manageData({
        name: 'bill:recurring',
        value: recurring ? '1' : '0',
      })
    )

    if (recurring && frequencyDays) {
      txBuilder.addOperation(
        Operation.manageData({
          name: 'bill:frequencyDays',
          value: String(frequencyDays),
        })
      )
    }

    const tx = txBuilder.setTimeout(300).build()
    return tx.toXDR()
  } catch (error) {
    throw parseContractError(error, {
      contractId: 'bill-payments',
      method: 'buildCreateBillTx',
    })
  }
}

export async function buildPayBillTx(caller: string, billId: string) {
  if (!validatePublicKey(caller)) {
    throw createValidationError(
      ContractErrorCode.INVALID_ADDRESS,
      'Invalid caller address',
      { contractId: 'bill-payments', method: 'buildPayBillTx', metadata: { caller } }
    )
  }

  if (!billId) {
    throw createValidationError(
      ContractErrorCode.INVALID_ADDRESS,
      'Bill ID is required',
      { contractId: 'bill-payments', method: 'buildPayBillTx', metadata: { billId } }
    )
  }

  try {
    const acctResp = await loadAccount(caller)
    const source = new Account(caller, acctResp.sequence)

    const tx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.manageData({ name: `bill:pay:${billId}`, value: '1' })
      )
      .setTimeout(300)
      .build()

    return tx.toXDR()
  } catch (error) {
    throw parseContractError(error, {
      contractId: 'bill-payments',
      method: 'buildPayBillTx',
    })
  }
}

export async function buildCancelBillTx(caller: string, billId: string) {
  if (!validatePublicKey(caller)) {
    throw createValidationError(
      ContractErrorCode.INVALID_ADDRESS,
      'Invalid caller address',
      { contractId: 'bill-payments', method: 'buildCancelBillTx', metadata: { caller } }
    )
  }

  if (!billId) {
    throw createValidationError(
      ContractErrorCode.INVALID_ADDRESS,
      'Bill ID is required',
      { contractId: 'bill-payments', method: 'buildCancelBillTx', metadata: { billId } }
    )
  }

  try {
    const acctResp = await loadAccount(caller)
    const source = new Account(caller, acctResp.sequence)

    const tx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.manageData({ name: `bill:cancel:${billId}`, value: '1' })
      )
      .setTimeout(300)
      .build()

    return tx.toXDR()
  } catch (error) {
    throw parseContractError(error, {
      contractId: 'bill-payments',
      method: 'buildCancelBillTx',
    })
  }
}

export default {
  getBill,
  getUnpaidBills,
  getAllBills,
  getTotalUnpaid,
  getOverdueBills,
  buildCreateBillTx,
  buildPayBillTx,
  buildCancelBillTx,
}