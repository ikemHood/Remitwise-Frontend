// Transaction builders for savings goals smart contract

import * as StellarSdk from '@stellar/stellar-sdk';
import { BuildTxResult } from '@/lib/types/savings-goals';

// Get contract ID from environment
const getContractId = (): string => {
  const contractId = process.env.NEXT_PUBLIC_SAVINGS_GOALS_CONTRACT_ID;
  if (!contractId) {
    throw new Error('NEXT_PUBLIC_SAVINGS_GOALS_CONTRACT_ID is not configured');
  }
  return contractId;
};

// Get network configuration
const getNetworkConfig = () => {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';
  const rpcUrl = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
  
  return {
    network,
    rpcUrl,
    networkPassphrase: network === 'mainnet' 
      ? StellarSdk.Networks.PUBLIC 
      : StellarSdk.Networks.TESTNET
  };
};

/**
 * Build a transaction to create a new savings goal
 * 
 * @param owner - Stellar public key of the goal owner
 * @param name - Name of the savings goal
 * @param targetAmount - Target amount to save
 * @param targetDate - Target date in ISO 8601 format
 * @returns Transaction XDR string
 */
export async function buildCreateGoalTx(
  owner: string,
  name: string,
  targetAmount: number,
  targetDate: string
): Promise<BuildTxResult> {
  const config = getNetworkConfig();
  const contractId = getContractId();
  
  // Create contract instance
  const contract = new StellarSdk.Contract(contractId);
  
  // Convert parameters to Stellar SDK types
  const ownerAddress = new StellarSdk.Address(owner);
  const nameScVal = StellarSdk.nativeToScVal(name, { type: 'string' });
  const amountScVal = StellarSdk.nativeToScVal(targetAmount, { type: 'i128' });
  
  // Convert date to Unix timestamp
  const targetTimestamp = Math.floor(new Date(targetDate).getTime() / 1000);
  const timestampScVal = StellarSdk.nativeToScVal(targetTimestamp, { type: 'u64' });
  
  // Build the operation
  const operation = contract.call(
    'create_goal',
    ownerAddress.toScVal(),
    nameScVal,
    amountScVal,
    timestampScVal
  );
  
  // Create source account
  const sourceAccount = await loadAccount(owner, config.rpcUrl);
  
  // Build transaction
  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(300) // 5 minutes
    .build();
  
  return {
    xdr: transaction.toXDR()
  };
}

/**
 * Build a transaction to add funds to a savings goal
 * 
 * @param caller - Stellar public key of the caller
 * @param goalId - Unique identifier of the goal
 * @param amount - Amount to add
 * @returns Transaction XDR string
 */
export async function buildAddToGoalTx(
  caller: string,
  goalId: string,
  amount: number
): Promise<BuildTxResult> {
  const config = getNetworkConfig();
  const contractId = getContractId();
  
  const contract = new StellarSdk.Contract(contractId);
  
  // Convert parameters
  const callerAddress = new StellarSdk.Address(caller);
  const goalIdScVal = StellarSdk.nativeToScVal(goalId, { type: 'string' });
  const amountScVal = StellarSdk.nativeToScVal(amount, { type: 'i128' });
  
  // Build operation
  const operation = contract.call(
    'add_to_goal',
    callerAddress.toScVal(),
    goalIdScVal,
    amountScVal
  );
  
  const sourceAccount = await loadAccount(caller, config.rpcUrl);
  
  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(300)
    .build();
  
  return {
    xdr: transaction.toXDR()
  };
}

/**
 * Build a transaction to withdraw funds from a savings goal
 * 
 * @param caller - Stellar public key of the caller
 * @param goalId - Unique identifier of the goal
 * @param amount - Amount to withdraw
 * @returns Transaction XDR string
 */
export async function buildWithdrawFromGoalTx(
  caller: string,
  goalId: string,
  amount: number
): Promise<BuildTxResult> {
  const config = getNetworkConfig();
  const contractId = getContractId();
  
  const contract = new StellarSdk.Contract(contractId);
  
  // Convert parameters
  const callerAddress = new StellarSdk.Address(caller);
  const goalIdScVal = StellarSdk.nativeToScVal(goalId, { type: 'string' });
  const amountScVal = StellarSdk.nativeToScVal(amount, { type: 'i128' });
  
  // Build operation
  const operation = contract.call(
    'withdraw_from_goal',
    callerAddress.toScVal(),
    goalIdScVal,
    amountScVal
  );
  
  const sourceAccount = await loadAccount(caller, config.rpcUrl);
  
  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(300)
    .build();
  
  return {
    xdr: transaction.toXDR()
  };
}

/**
 * Build a transaction to lock a savings goal
 * 
 * @param caller - Stellar public key of the caller
 * @param goalId - Unique identifier of the goal
 * @returns Transaction XDR string
 */
export async function buildLockGoalTx(
  caller: string,
  goalId: string
): Promise<BuildTxResult> {
  const config = getNetworkConfig();
  const contractId = getContractId();
  
  const contract = new StellarSdk.Contract(contractId);
  
  // Convert parameters
  const callerAddress = new StellarSdk.Address(caller);
  const goalIdScVal = StellarSdk.nativeToScVal(goalId, { type: 'string' });
  
  // Build operation
  const operation = contract.call(
    'lock_goal',
    callerAddress.toScVal(),
    goalIdScVal
  );
  
  const sourceAccount = await loadAccount(caller, config.rpcUrl);
  
  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(300)
    .build();
  
  return {
    xdr: transaction.toXDR()
  };
}

/**
 * Build a transaction to unlock a savings goal
 * 
 * @param caller - Stellar public key of the caller
 * @param goalId - Unique identifier of the goal
 * @returns Transaction XDR string
 */
export async function buildUnlockGoalTx(
  caller: string,
  goalId: string
): Promise<BuildTxResult> {
  const config = getNetworkConfig();
  const contractId = getContractId();
  
  const contract = new StellarSdk.Contract(contractId);
  
  // Convert parameters
  const callerAddress = new StellarSdk.Address(caller);
  const goalIdScVal = StellarSdk.nativeToScVal(goalId, { type: 'string' });
  
  // Build operation
  const operation = contract.call(
    'unlock_goal',
    callerAddress.toScVal(),
    goalIdScVal
  );
  
  const sourceAccount = await loadAccount(caller, config.rpcUrl);
  
  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(300)
    .build();
  
  return {
    xdr: transaction.toXDR()
  };
}

/**
 * Helper function to load account from Stellar network
 */
async function loadAccount(publicKey: string, rpcUrl: string): Promise<StellarSdk.Account> {
  const server = new StellarSdk.SorobanRpc.Server(rpcUrl);
  
  try {
    const account = await server.getAccount(publicKey);
    return account;
  } catch (error) {
    // If account doesn't exist, create a placeholder with sequence 0
    // The actual sequence will be set when the transaction is submitted
    return new StellarSdk.Account(publicKey, '0');
  }
}
