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

export async function buildCreatePolicyTx(owner: string, name: string, coverageType: string, monthlyPremium: number, coverageAmount: number) {
  if (!validatePublicKey(owner)) throw new Error('invalid-owner')
  if (!name || typeof name !== 'string') throw new Error('invalid-name')
  if (!coverageType || typeof coverageType !== 'string') throw new Error('invalid-coverageType')
  if (!(monthlyPremium > 0)) throw new Error('invalid-monthlyPremium')
  if (!(coverageAmount > 0)) throw new Error('invalid-coverageAmount')

  const acctResp = await loadAccount(owner)
  const source = new Account(owner, acctResp.sequence)

  const txBuilder = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })

  txBuilder.addOperation(Operation.manageData({ name: 'policy:name', value: name.slice(0, 64) }))
  txBuilder.addOperation(Operation.manageData({ name: 'policy:coverageType', value: coverageType.slice(0, 64) }))
  txBuilder.addOperation(Operation.manageData({ name: 'policy:monthlyPremium', value: String(monthlyPremium) }))
  txBuilder.addOperation(Operation.manageData({ name: 'policy:coverageAmount', value: String(coverageAmount) }))

  const tx = txBuilder.setTimeout(300).build()
  return tx.toXDR()
}

export async function buildPayPremiumTx(caller: string, policyId: string) {
  if (!validatePublicKey(caller)) throw new Error('invalid-caller')
  if (!policyId) throw new Error('invalid-policyId')

  const acctResp = await loadAccount(caller)
  const source = new Account(caller, acctResp.sequence)

  const txBuilder = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })

  txBuilder.addOperation(Operation.manageData({ name: `policy:pay:${policyId}`, value: '1' }))

  const tx = txBuilder.setTimeout(300).build()
  return tx.toXDR()
}

export async function buildDeactivatePolicyTx(caller: string, policyId: string) {
  if (!validatePublicKey(caller)) throw new Error('invalid-caller')
  if (!policyId) throw new Error('invalid-policyId')

  const acctResp = await loadAccount(caller)
  const source = new Account(caller, acctResp.sequence)

  const txBuilder = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })

  txBuilder.addOperation(Operation.manageData({ name: `policy:deactivate:${policyId}`, value: '1' }))

  const tx = txBuilder.setTimeout(300).build()
  return tx.toXDR()
}

export default {
  buildCreatePolicyTx,
  buildPayPremiumTx,
  buildDeactivatePolicyTx,
}
