export class WebSerialService {
  public onData: ((data: string) => void) | null = null;
  private port: any | null = null;
  private writer: any | null = null;
  private reader: any | null = null;

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

  async sendCommand(cmd: any) {
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

    console.log("Simulating compilation of .ino to binary...");
    // Mock compilation: In a real app this would compile via a backend or WASM toolchain.
    // We create a mock binary Uint8Array to represent compiled firmware.
    const binarySize = Math.max(1024, code.length * 3);
    const mockBinary = new Uint8Array(binarySize);

    for(let i = 0; i < binarySize; i++) {
        mockBinary[i] = (code.charCodeAt(i % code.length) + i) % 256;
    }

    console.log(`Compilation complete. Uploading ${binarySize} bytes of firmware...`);
    await this.writer.write(mockBinary);
    console.log("Firmware upload complete.");
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
