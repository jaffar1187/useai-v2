import type { ChainRecord } from "@useai/types";
import { buildChainRecord } from "@useai/crypto";
import { appendChainRecord, getOrCreateKeystore } from "@useai/storage";
import { randomUUID } from "node:crypto";

export class SessionState {
  readonly sessionId: string;
  private chainTip: string = "0".repeat(64);
  private privateKey: Buffer | null = null;
  private _client: string = "unknown";
  private _startedAt: Date | null = null;

  constructor(sessionId?: string) {
    this.sessionId = sessionId ?? `ses_${randomUUID()}`;
  }

  get client(): string {
    return this._client;
  }

  get startedAt(): Date | null {
    return this._startedAt;
  }

  get lastHash(): string {
    return this.chainTip;
  }

  async init(): Promise<void> {
    const { privateKey } = await getOrCreateKeystore();
    this.privateKey = privateKey;
  }

  async writeRecord(
    type: ChainRecord["type"],
    payload: Record<string, unknown>,
  ): Promise<ChainRecord> {
    if (!this.privateKey) await this.init();

    const record = buildChainRecord({
      type,
      sessionId: this.sessionId,
      prevHash: this.chainTip,
      payload,
      privateKey: this.privateKey!,
    });

    await appendChainRecord(this.sessionId, record);
    this.chainTip = record.hash;
    return record;
  }

  setClient(client: string): void {
    this._client = client;
  }

  markStarted(): void {
    this._startedAt = new Date();
  }
}
