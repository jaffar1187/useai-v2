import { createHash, sign } from "node:crypto";
import type { ChainRecord, ChainRecordType } from "@useai/types";

export function computeHash(data: string, prevHash: string): string {
  return createHash("sha256")
    .update(data + prevHash)
    .digest("hex");
}

export function signHash(hash: string, privateKey: Buffer): string {
  const sig = sign(null, Buffer.from(hash, "hex"), {
    key: privateKey,
    format: "der",
    type: "pkcs8",
  });
  return sig.toString("base64");
}

export function buildChainRecord(opts: {
  type: ChainRecordType;
  sessionId: string;
  prevHash: string;
  payload: Record<string, unknown>;
  privateKey: Buffer;
}): ChainRecord {
  const timestamp = new Date().toISOString();
  const data = JSON.stringify({
    type: opts.type,
    sessionId: opts.sessionId,
    timestamp,
    payload: opts.payload,
  });

  const hash = computeHash(data, opts.prevHash);
  const signature = signHash(hash, opts.privateKey);

  return {
    type: opts.type,
    sessionId: opts.sessionId,
    timestamp,
    prevHash: opts.prevHash,
    hash,
    signature,
    payload: opts.payload,
  };
}
