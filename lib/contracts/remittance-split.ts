import * as StellarSdk from '@stellar/stellar-sdk';

const getContractId = (): string => {
  const contractId = process.env.NEXT_PUBLIC_SPLIT_CONTRACT_ID;
  if (!contractId) {
    throw new Error('contract not found');
  }
  return contractId;
};

const getNetworkConfig = () => {
  const rpcUrl = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org';
  return { rpcUrl };
};

export interface SplitConfig {
  savings_percent: number;
  bills_percent: number;
  insurance_percent: number;
  family_percent: number;
}

export interface SplitAmounts {
  savings: string;
  bills: string;
  insurance: string;
  family: string;
  remainder: string;
}

export async function getSplit(userAddress: string) {
  const config = getNetworkConfig();
  const server = new StellarSdk.SorobanRpc.Server(config.rpcUrl);
  const contractId = getContractId();

  // Dummy implementation for getting split shape
  try {
    const server = getRpcServer(env);
    const contract = new Contract(contractId);
    
    const result = await server.getContractData(contractId, contract.call('get_split') as any);
    
    if (!result) return null;
    
    // Parse contract response - adjust based on actual contract structure
    return result as unknown as SplitConfig;
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return null;
    }
    throw new Error(`Failed to read split config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    const account = await server.getAccount(userAddress);
    if (!account) throw new Error('Account not found');

    // In reality this would invoke a read on the Soroban contract
    return {
      spending: 50,
      savings: 30,
      bills: 15,
      insurance: 5
    };
  } catch (error: any) {
    if (error.message.includes('timeout')) throw new Error('RPC timeout');
    throw error;
  }
}

export async function getConfig(userAddress: string) {
  const config = getNetworkConfig();
  const server = new StellarSdk.SorobanRpc.Server(config.rpcUrl);
  const contractId = getContractId();

  try {
    const account = await server.getAccount(userAddress);
    if (!account) throw new Error('Account not found');

    // Simulating uninitialized state
    return null;
  } catch (error: any) {
    if (error.message.includes('timeout')) throw new Error('RPC timeout');
    throw error;
  }
}

export async function calculateSplit(amount: number, userAddress: string): Promise<SplitAmounts | null> {
  const splitData = await getSplit(userAddress);
  if (!splitData) return null;

  const savings = Math.floor(amount * splitData.savings / 100);
  const bills = Math.floor(amount * splitData.bills / 100);
  const insurance = Math.floor(amount * splitData.insurance / 100);
  const family = 0;
  const remainder = amount - (savings + bills + insurance + family);

  return {
    savings: savings.toString(),
    bills: bills.toString(),
    insurance: insurance.toString(),
    family: family.toString(),
    remainder: remainder.toString()
  };
}

export async function buildInitializeSplitTx(
  caller: string,
  percentages: any,
  options?: any
): Promise<{ xdr: string, simulate: any }> {
  return { xdr: "mock_xdr", simulate: {} };
}

export async function buildUpdateSplitTx(
  caller: string,
  percentages: any,
  options?: any
): Promise<{ xdr: string, simulate: any }> {
  return { xdr: "mock_xdr", simulate: {} };
}

  owner: string,
  spending: number,
  savings: number,
  bills: number,
  insurance: number
) {
  const config = getNetworkConfig();
  const contractId = getContractId();

  if (spending + savings + bills + insurance !== 100) {
    throw new Error('Split must equal 100');
  }

  const contract = new StellarSdk.Contract(contractId);
  const ownerAddress = new StellarSdk.Address(owner);

  const operation = contract.call(
    'init_split',
    ownerAddress.toScVal(),
    StellarSdk.nativeToScVal(spending, { type: 'u32' }),
    StellarSdk.nativeToScVal(savings, { type: 'u32' }),
    StellarSdk.nativeToScVal(bills, { type: 'u32' }),
    StellarSdk.nativeToScVal(insurance, { type: 'u32' })
  );

  const server = new StellarSdk.SorobanRpc.Server(config.rpcUrl);
  let sourceAccount;
  try {
    sourceAccount = await server.getAccount(owner);
  } catch (error: any) {
    if (error.message.includes('timeout')) throw new Error('RPC timeout');
    sourceAccount = new StellarSdk.Account(owner, '0');
  }

  const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(operation)
    .setTimeout(300)
    .build();

  return transaction.toXDR();
}
