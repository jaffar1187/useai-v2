import { createHash, verify as cryptoVerify } from "node:crypto";
import type { ChainRecord } from "@useai/types";

export function verifyRecord(
  record: ChainRecord,
  publicKey: Buffer,
): boolean {
  const data = JSON.stringify({
    type: record.type,
    sessionId: record.sessionId,
    timestamp: record.timestamp,
    payload: record.payload,
  });

  const expectedHash = createHash("sha256")
    .update(data + record.prevHash)
    .digest("hex");

  if (expectedHash !== record.hash) return false;

  return cryptoVerify(
    null,
    Buffer.from(record.hash, "hex"),
    { key: publicKey, format: "der", type: "spki" },
    Buffer.from(record.signature, "base64"),
  );
}

export function verifyChain(
  records: ChainRecord[],
  publicKey: Buffer,
): { valid: boolean; brokenAt?: number } {
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    if (!record || !verifyRecord(record, publicKey)) {
      return { valid: false, brokenAt: i };
    }
    const prev = records[i - 1];
    if (i > 0 && prev && record.prevHash !== prev.hash) {
      return { valid: false, brokenAt: i };
    }
  }
  return { valid: true };
}
