export type ChainRecordType =
  | "session_start"
  | "heartbeat"
  | "session_end"
  | "session_seal";

export interface ChainRecord {
  type: ChainRecordType;
  sessionId: string;
  timestamp: string;
  prevHash: string;
  hash: string;
  signature: string;
  payload: Record<string, unknown>;
}

export interface Keystore {
  publicKey: string;
  encryptedPrivateKey: string;
  iv: string;
  authTag: string;
  createdAt: string;
}
