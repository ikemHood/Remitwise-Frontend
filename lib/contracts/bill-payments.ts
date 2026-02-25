import { Server, Networks, Account, TransactionBuilder, Operation, BASE_FEE, StrKey } from '@stellar/stellar-sdk'

const HORIZON_URL = process.env.HORIZON_URL || 'https://horizon-testnet.stellar.org'
const NETWORK_PASSPHRASE = process.env.NETWORK_PASSPHRASE || Networks.TESTNET
const server = new Server(HORIZON_URL)

function validatePublicKey(pk: string) {
  try {
    return StrKey.isValidEd25519PublicKey(pk)
  } catch (e) {
    return false
  }
}

async function loadAccount(accountId: string) {
  if (!validatePublicKey(accountId)) throw new Error('invalid-account')
  return await server.loadAccount(accountId)
}

export async function buildCreateBillTx(owner: string, name: string, amount: number, dueDate: string, recurring: boolean, frequencyDays?: number) {
  if (!validatePublicKey(owner)) throw new Error('invalid-owner')
  if (!(amount > 0)) throw new Error('invalid-amount')
  if (recurring && !(frequencyDays && frequencyDays > 0)) throw new Error('invalid-frequency')
  // basic date validation
  if (Number.isNaN(Date.parse(dueDate))) throw new Error('invalid-dueDate')

  const acctResp = await loadAccount(owner)
  const source = new Account(owner, acctResp.sequence)

  const txBuilder = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })

  // Use several ManageData ops to keep values under the 64-byte limit per entry
  txBuilder.addOperation(Operation.manageData({ name: 'bill:name', value: name.slice(0, 64) }))
  txBuilder.addOperation(Operation.manageData({ name: 'bill:amount', value: String(amount) }))
  txBuilder.addOperation(Operation.manageData({ name: 'bill:dueDate', value: new Date(dueDate).toISOString() }))
  txBuilder.addOperation(Operation.manageData({ name: 'bill:recurring', value: recurring ? '1' : '0' }))
  if (recurring && frequencyDays) {
    txBuilder.addOperation(Operation.manageData({ name: 'bill:frequencyDays', value: String(frequencyDays) }))
  }

  const tx = txBuilder.setTimeout(300).build()
  return tx.toXDR()
}

export async function buildPayBillTx(caller: string, billId: string) {
  if (!validatePublicKey(caller)) throw new Error('invalid-caller')
  if (!billId) throw new Error('invalid-billId')

  const acctResp = await loadAccount(caller)
  const source = new Account(caller, acctResp.sequence)

  const txBuilder = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })

  txBuilder.addOperation(Operation.manageData({ name: `bill:pay:${billId}`, value: '1' }))

  const tx = txBuilder.setTimeout(300).build()
  return tx.toXDR()
}

export async function buildCancelBillTx(caller: string, billId: string) {
  if (!validatePublicKey(caller)) throw new Error('invalid-caller')
  if (!billId) throw new Error('invalid-billId')

  const acctResp = await loadAccount(caller)
  const source = new Account(caller, acctResp.sequence)

  const txBuilder = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })

  txBuilder.addOperation(Operation.manageData({ name: `bill:cancel:${billId}`, value: '1' }))

  const tx = txBuilder.setTimeout(300).build()
  return tx.toXDR()
}

export default {
  buildCreateBillTx,
  buildPayBillTx,
  buildCancelBillTx,
}
