import { DIDDocument, PublicKey } from 'did-resolver';
import {
  Account,
  clusterApiUrl,
  PublicKey as SolanaPublicKey,
} from '@solana/web3.js';
import { DID_METHOD, ExtendedCluster } from './constants';
import { decode, encode } from 'bs58';

// a 64-byte private key on the X25519 curve.
// In string form it is base58-encoded
export type PrivateKey = number[] | string | Buffer | Uint8Array;
export type PublicKeyBase58 = string;

export type RegisterRequest = {
  payer: PrivateKey;
  document?: Partial<DIDDocument>;
  owner?: PublicKeyBase58;
  cluster?: ExtendedCluster;
};

export const privateKeyIsArray = (
  privateKey: PrivateKey
): privateKey is number[] => Array.isArray(privateKey);
export const privateKeyIsString = (
  privateKey: PrivateKey
): privateKey is string => typeof privateKey === 'string';
export const privateKeyIsBuffer = (
  privateKey: PrivateKey
): privateKey is Buffer => Buffer.isBuffer(privateKey);
export const privateKeyIsUint8Array = (
  privateKey: PrivateKey
): privateKey is Uint8Array => privateKey instanceof Uint8Array;

/**
 * Create a Solana account object from an x25519 private key
 * @param privateKey
 */
export const makeAccount = (privateKey: PrivateKey): Account => {
  if (
    privateKeyIsArray(privateKey) ||
    privateKeyIsBuffer(privateKey) ||
    privateKeyIsUint8Array(privateKey)
  )
    return new Account(privateKey);
  if (privateKeyIsString(privateKey)) {
    const privateKeyHex = decode(privateKey);
    return new Account(privateKeyHex);
  }

  throw new Error('Incompatible private key format');
};

/**
 * Given a private key on the x25519 curve, get its public key
 * @param privateKey
 */
export const getPublicKey = (privateKey: PrivateKey): SolanaPublicKey =>
  makeAccount(privateKey).publicKey;

/**
 * Converts a Curve25519 key in Base58 encoding to a solana PublicKey object
 * @param publicKeyString
 */
export const stringToPublicKey = (publicKeyString: string): SolanaPublicKey =>
  new SolanaPublicKey(publicKeyString);

export const matches = (owner: PublicKeyBase58) => (key: PublicKey) =>
  key.publicKeyBase58 === owner;

const DID_REGEX = new RegExp('^did:' + DID_METHOD + ':?(.*):(.+)$');

const matchDID = (did: string): RegExpExecArray => {
  const matches = DID_REGEX.exec(did);

  if (!matches) throw new Error('Invalid DID');
  return matches;
};

export const isDID = (did: string): boolean => {
  try {
    matchDID(did);
    return true;
  } catch {
    return false;
  }
};

export const extractMethodIdentifierFromDID = (did: string): string =>
  matchDID(did)[2];

export const identifierToPubkey = (did: string): SolanaPublicKey => {
  const identifier = extractMethodIdentifierFromDID(did);

  return new SolanaPublicKey(identifier);
};

export const identifierToCluster = (did: string): ExtendedCluster => {
  const clusterString = matchDID(did)[1];

  // TODO throw an error here if the cluster is not recognised - requires adding a cluster enum rather than using
  // the Cluster and ExtendedCluster string literal types

  // Default to mainnet if no cluster is specified as per the spec
  return (clusterString as ExtendedCluster) || 'mainnet-beta';
};

export const publicKeyAndClusterToDID = (
  publicKey: SolanaPublicKey,
  cluster: ExtendedCluster = 'mainnet-beta'
) => {
  // no prefix for mainnet
  const identifierPrefix = cluster === 'mainnet-beta' ? '' : cluster + ':';
  const identifier = publicKey.toBase58();
  return `did:${DID_METHOD}:${identifierPrefix}${identifier}`;
};

export const accountAndClusterToDID = (
  account: Account,
  cluster: ExtendedCluster = 'mainnet-beta'
) => publicKeyAndClusterToDID(account.publicKey, cluster);

export const solanaUrlForCluster = (cluster: ExtendedCluster) =>
  cluster === 'localnet' ? 'http://localhost:8899' : clusterApiUrl(cluster);

type EncodedKeyPair = {
  secretKey: string;
  publicKey: string;
};
export const generateKeypair = (): EncodedKeyPair => {
  const account = new Account();
  return {
    secretKey: encode(account.secretKey),
    publicKey: account.publicKey.toBase58(),
  };
};
