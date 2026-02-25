import * as StellarSdk from '@stellar/stellar-sdk';
import type { SorobanRpc } from '@stellar/stellar-sdk';

const SOROBAN_RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';

let server: SorobanRpc.Server | null = null;

export function getSorobanClient(): SorobanRpc.Server {
  if (!server) {
    server = new StellarSdk.SorobanRpc.Server(SOROBAN_RPC_URL, {
      allowHttp: SOROBAN_RPC_URL.startsWith('http://'),
    });
  }
  return server;
}

export async function createTransaction(publicKey: string) {
  const server = getSorobanClient();


  const accountData = await server.getAccount(publicKey);
  const account = new StellarSdk.Account(publicKey,  String(accountData.sequenceNumber) );

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .setTimeout(30)
    .build();

  return transaction;
}