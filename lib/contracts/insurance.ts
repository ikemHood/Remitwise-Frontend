import {
    Contract,
    Horizon,
    nativeToScVal,
    scValToNative,
    xdr,
  } from "@stellar/stellar-sdk";
  
  // ── Config ──────────────────────────────────────────────────────────────────
  const SOROBAN_RPC_URL =
    process.env.SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org";
  const INSURANCE_CONTRACT_ID = process.env.INSURANCE_CONTRACT_ID ?? "";
  const NETWORK_PASSPHRASE =
    process.env.STELLAR_NETWORK_PASSPHRASE ??
    "Test SDF Network ; September 2015";
  
  // ── Types ────────────────────────────────────────────────────────────────────
  export interface Policy {
    id: string;
    name: string;
    coverageType: string;
    monthlyPremium: number;
    coverageAmount: number;
    active: boolean;
    nextPaymentDate: string;
  }
  
  // ── RPC Client ───────────────────────────────────────────────────────────────
  function getRpcServer() {
  const { rpc } = require("@stellar/stellar-sdk") as {
    rpc: {
      Server: new (url: string) => {
        simulateTransaction: (tx: unknown) => Promise<unknown>;
      };
    };
  };
  return new rpc.Server(SOROBAN_RPC_URL);
}
  
  // ── Raw contract call helper ─────────────────────────────────────────────────
  async function callContractView(
    method: string,
    args: xdr.ScVal[]
  ): Promise<xdr.ScVal> {
    const { Transaction, TransactionBuilder, Account, BASE_FEE } = await import(
      "@stellar/stellar-sdk"
    );
  
    const contract = new Contract(INSURANCE_CONTRACT_ID);
    const server = getRpcServer();
  
    // A "view" simulation doesn't need a real source account funded on-chain;
    // we use a well-known testnet account as the simulation source.
    const sourceAccount = new Account(
      "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN",
      "0"
    );
  
    const tx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build();
  
    const result = (await server.simulateTransaction(tx)) as {
      result?: { retval: xdr.ScVal };
      error?: string;
    };
  
    if (result.error) {
      throw new Error(`Soroban simulation error: ${result.error}`);
    }
  
    if (!result.result?.retval) {
      throw new Error(`No return value from contract method: ${method}`);
    }
  
    return result.result.retval;
  }
  
  // ── Mapper ───────────────────────────────────────────────────────────────────
  function mapScValToPolicy(raw: unknown): Policy {
    // The contract is expected to return a map/struct with these keys.
    // scValToNative converts Soroban ScVal → plain JS object.
    const obj = scValToNative(raw as xdr.ScVal) as Record<string, unknown>;
  
    return {
      id: String(obj.id),
      name: String(obj.name),
      coverageType: String(obj.coverage_type ?? obj.coverageType),
      monthlyPremium: Number(obj.monthly_premium ?? obj.monthlyPremium),
      coverageAmount: Number(obj.coverage_amount ?? obj.coverageAmount),
      active: Boolean(obj.active),
      nextPaymentDate: String(obj.next_payment_date ?? obj.nextPaymentDate),
    };
  }
  
  // ── Public API ────────────────────────────────────────────────────────────────
  
  /**
   * Fetch a single policy by ID.
   * Throws a { code: 'NOT_FOUND' } error if the contract returns nothing.
   */
  export async function getPolicy(id: string): Promise<Policy> {
    const scVal = await callContractView("get_policy", [
      nativeToScVal(id, { type: "string" }),
    ]);
  
    const native = scValToNative(scVal);
    if (!native) {
      const err = new Error(`Policy not found: ${id}`) as Error & {
        code: string;
      };
      err.code = "NOT_FOUND";
      throw err;
    }
  
    return mapScValToPolicy(scVal);
  }
  
  /**
   * Fetch all active policies for a given Stellar account address (owner).
   */
  export async function getActivePolicies(owner: string): Promise<Policy[]> {
    if (!owner || !/^G[A-Z0-9]{55}$/.test(owner)) {
      throw Object.assign(new Error("Invalid Stellar address"), { code: "INVALID_ADDRESS" });
    }
  
    const scVal = await callContractView("get_active_policies", [
      nativeToScVal(owner, { type: "address" }),
    ]);
  
    const list = scValToNative(scVal) as unknown[];
    if (!Array.isArray(list)) return [];
  
    return list.map(mapScValToPolicy);
  }
  
  /**
   * Returns the sum of monthly premiums for all active policies of the owner.
   */
  export async function getTotalMonthlyPremium(owner: string): Promise<number> {
    if (!owner || !/^G[A-Z0-9]{55}$/.test(owner)) {
      throw Object.assign(new Error("Invalid Stellar address"), { code: "INVALID_ADDRESS" });
    }
  
    const scVal = await callContractView("get_total_monthly_premium", [
      nativeToScVal(owner, { type: "address" }),
    ]);
  
    return Number(scValToNative(scVal));
  }
