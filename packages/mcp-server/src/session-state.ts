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
  private _taskType: string = "other";
  private _title: string | null = null;
  private _privateTitle: string | null = null;
  private _project: string | null = null;
  private _model: string | null = null;
  private _prompt: string | null = null;
  private _promptImages: Array<{ type: "image"; description: string }> | null = null;

  constructor() {
    this.sessionId = `ses_${randomUUID()}`;
  }

  get client(): string { return this._client; }
  get startedAt(): Date | null { return this._startedAt; }
  get lastHash(): string { return this.chainTip; }
  get taskType(): string { return this._taskType; }
  get title(): string | null { return this._title; }
  get privateTitle(): string | null { return this._privateTitle; }
  get project(): string | null { return this._project; }
  get model(): string | null { return this._model; }
  get prompt(): string | null { return this._prompt; }
  get promptImages(): Array<{ type: "image"; description: string }> | null { return this._promptImages; }

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

  setClient(client: string): void { this._client = client; }
  setTaskType(taskType: string): void { this._taskType = taskType; }
  setTitle(title: string | null): void { this._title = title; }
  setPrivateTitle(privateTitle: string | null): void { this._privateTitle = privateTitle; }
  setProject(project: string | null): void { this._project = project; }
  setModel(model: string | null): void { this._model = model; }
  setPrompt(prompt: string | null): void { this._prompt = prompt; }
  setPromptImages(images: Array<{ type: "image"; description: string }> | null): void { this._promptImages = images; }

  markStarted(): void {
    this._startedAt = new Date();
  }
}
