interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  close(): Promise<void>;
  readable: ReadableStream<Uint8Array>;
  writable: WritableStream<Uint8Array>;
}

interface WritableStreamDefaultWriter {
  write(data: Uint8Array): Promise<void>;
  releaseLock(): void;
}

interface ReadableStreamDefaultReader {
  read(): Promise<{ value: Uint8Array | undefined; done: boolean }>;
  cancel(): Promise<void>;
}

declare const navigator: { serial?: { requestPort(): Promise<SerialPort> } };

export class WebSerialService {
  public onData: ((data: string) => void) | null = null;
  private port: SerialPort | null = null;
  private writer: WritableStreamDefaultWriter | null = null;
  private reader: ReadableStreamDefaultReader | null = null;

  async connect() {
    try {
      // @ts-ignore - Web Serial API is experimental
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 115200 });
      this.writer = this.port.writable.getWriter();
      this.reader = this.port.readable.getReader();
      this.readLoop();
      return true;
    } catch (e) {
      console.error("Serial connection failed", e);
      return false;
    }
  }

  async sendCommand(cmd: Record<string, unknown>) {
    if (!this.writer) return;
    const encoder = new TextEncoder();
    const data = JSON.stringify(cmd) + "\n";
    await this.writer.write(encoder.encode(data));
  }

  async readLoop() {
    if (!this.reader) return;
    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value && this.onData) {
          const decoder = new TextDecoder();
          this.onData(decoder.decode(value));
        }
      }
    } catch (e) {
      console.error("Serial read error", e);
    }
  }

  async sendCode(code: string) {
    if (!this.writer) return;
    const encoder = new TextEncoder();
    await this.writer.write(encoder.encode(code + "\n"));
  }

  async disconnect() {
    if (this.reader) await this.reader.cancel();
    if (this.writer) this.writer.releaseLock();
    if (this.port) await this.port.close();
    this.port = null;
    this.writer = null;
    this.reader = null;
  }

  isConnected() {
    return this.port !== null;
  }
}

export const serialService = new WebSerialService();
